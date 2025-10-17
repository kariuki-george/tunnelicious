package main

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	agent "github.com/kariuki-george/tunnelicious/gen/proto"
	"github.com/rs/zerolog/log"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/urfave/cli/v3"
)

func main() {
	app := &cli.Command{
		Name:  "tunnelicious 📍",
		Usage: "Run the tunnel agent (connects to proxy and forwards traffic)",
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:    "target",
				Aliases: []string{"t"},
				Value:   "http://localhost:20420",
				Usage:   "Local target URL to forward traffic to",
			},
			&cli.StringFlag{
				Name:     "token",
				Aliases:  []string{"auth"},
				Usage:    "Agent auth token (for registration)",
				Required: true,
			},
			&cli.BoolFlag{
				Name:  "debug",
				Usage: "Enable verbose debug logs",
			},
			&cli.StringFlag{
				Name:    "controlplane",
				Usage:   "Url to the controlplane",
				Aliases: []string{"ctrlp"},
				Value:   "localhost:20420",
			},
			&cli.StringFlag{
				Name:  "proxy",
				Usage: "Url to the proxy",
				Value: "http://localhost:22420",
			},
			&cli.BoolFlag{
				Name:  "insecure",
				Usage: "Connect targets insecurely",
				Value: false,
			},
		},

		Action: func(_ context.Context, c *cli.Command) error {
			target := c.String("target")
			token := c.String("token")
			controlplane := c.String("controlplane")
			proxy := c.String("proxy")
			insecure := c.Bool("insecure")
			fmt.Println("🚀 Starting tunnelicious...")
			fmt.Printf(" → Target:         %s\n", target)
			fmt.Printf(" → Proxy:          %s\n", proxy)
			fmt.Printf(" → Control Plane:  %s\n", controlplane)
			fmt.Printf(" → Protocol:       %s\n", "http/2")
			fmt.Printf(" → Insecure:       %t\n", insecure)

			if c.Bool("debug") {
				fmt.Println("Debug logging enabled.")
			}

			Run(token, target, controlplane, proxy, insecure)

			return nil
		},
	}

	if err := app.Run(context.Background(), os.Args); err != nil {
		log.Fatal().Err(err).Msg("could run tunnelicious")
	}
}
func Run(token, targetUrl, ctrlPlane, proxyUrl string, insecureTransport bool) {

	ctx := context.Background()
	// 1. register with control server

	var creds grpc.DialOption
	dialer := grpc.WithContextDialer(func(ctx context.Context, addr string) (net.Conn, error) {
		return (&net.Dialer{
			Timeout:   10 * time.Second,
			KeepAlive: 30 * time.Second,
			// Restrict to IPv4 only
		}).DialContext(ctx, "tcp4", addr)
	})

	if insecureTransport {
		creds = grpc.WithTransportCredentials(insecure.NewCredentials())
	} else {
		creds = grpc.WithTransportCredentials(credentials.NewClientTLSFromCert(nil, ""))
	}
	ctrlConn, err := grpc.NewClient(ctrlPlane, creds, dialer)
	if err != nil {
		log.Fatal().Err(err).Msg("ctrl dial failed")
	}
	defer ctrlConn.Close()
	ctrl := agent.NewControlClient(ctrlConn)
	reg, err := ctrl.RegisterAgent(ctx, &agent.RegisterRequest{
		Token: token,
		Mode:  agent.TunnelMode_HTTP2,
	})
	if err != nil {
		log.Fatal().Err(err).Msg("ctrl registration failed")

	}
	scheme, proxyHost := splitURL(proxyUrl)

	proxyUrl = fmt.Sprintf("%s://%s.%s", scheme, reg.AssignedSubdomain, proxyHost)

	fmt.Printf(" → Tunnel:          %s\n", proxyUrl)
	fmt.Println()
	fmt.Println()

	agentId := reg.AssignedSubdomain
	log.Info().Msgf("registered ok=%v sub=%s", reg.Ok, reg.AssignedSubdomain)

	// 2. Connet to proxy tunnel endpoint

	pconn, err := grpc.NewClient(proxyHost, creds, dialer)
	if err != nil {
		log.Fatal().Err(err).Msg("proxy dial failed")
	}
	defer pconn.Close()

	proxy := agent.NewProxyClient(pconn)

	cresp, err := proxy.Connect(ctx, &agent.ConnectRequest{
		Subdomain: agentId,
		Token:     token,
	})
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to proxy")
	}

	if !cresp.Ok {
		log.Fatal().Msg("proxy refused connection")
	}

	// connect and register

	stream, err := proxy.Tunnel(ctx)

	if err != nil {
		log.Fatal().Err(err).Msg("failed to open a bidi proxy stream")
	}

	// send the initial chunk to proxy to register tunnel
	err = stream.Send(&agent.StreamChunk{StreamId: agentId})

	if err != nil {
		log.Fatal().Err(err).Msg("failed to register to proxy")
	}

	// handle connections

	go func() {
		for {
			_, _ = ctrl.Heartbeat(ctx, &agent.HeartbeatRequest{AgentId: agentId})
			time.Sleep(15 * time.Second)
		}
	}()

	// receive an echo
	for {
		req, err := stream.Recv()
		if err == io.EOF {
			log.Info().Msg("stream closed")
			break
		}
		if err != nil {
			log.Fatal().Err(err).Msg("failed to recv data to proxy")
		}

		go func(raw *agent.StreamChunk) {
			log.Debug().Msgf("got message: %s", string(raw.Payload))

			req, err := http.ReadRequest(bufio.NewReader(bytes.NewBuffer(raw.Payload)))
			if err != nil {
				log.Error().Err(err).Msg("failed to parse request")
				return
			}
			log.Info().Msg(req.URL.String())
			// url := path.Join(targetUrl, req.URL.String())

			scheme, host := splitURL(targetUrl)

			req.RequestURI = ""
			req.URL.Scheme = scheme
			req.URL.Host = host
			req.Host = host

			client := &http.Client{}
			resp, err := client.Do(req)
			if err != nil {
				log.Error().Err(err).Msg("send failed")
			}

			buf := new(bytes.Buffer)

			_ = resp.Write(buf)

			err = stream.Send(&agent.StreamChunk{StreamId: raw.StreamId, Payload: buf.Bytes()})
			if err != nil {
				log.Error().Err(err).Msg("send failed")
			}
		}(req)
	}
}

func splitURL(url string) (scheme string, host string) {

	parts := strings.Split(url, "://")

	scheme = "http"
	host = ""
	if len(parts) == 1 {
		host = parts[0]
	} else {
		scheme = parts[0]
		host = parts[1]
	}

	return

}
