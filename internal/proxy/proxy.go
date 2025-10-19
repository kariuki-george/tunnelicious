package proxy

import (
	"context"
	"fmt"
	"io"

	proxy "github.com/kariuki-george/tunnelicious/gen/proto"
	"github.com/rs/zerolog/log"
)

type Proxy struct {
	proxy.UnimplementedProxyServer
	tunnels map[string]Tunnel
}

func NewProxy() *Proxy {
	return &Proxy{
		tunnels: make(map[string]Tunnel),
	}
}

func (p *Proxy) Connect(ctx context.Context, agent *proxy.ConnectRequest) (*proxy.ConnectResponse, error) {

	if len(p.tunnels) > 20 {
		// limit number of tunnels
		return &proxy.ConnectResponse{Ok: false}, fmt.Errorf("proxy tunnel count limit reached")
	}

	_, ok := p.tunnels[agent.Subdomain]

	if ok {
		return &proxy.ConnectResponse{Ok: false}, fmt.Errorf("%s tunnel is already open", agent.Subdomain)
	}

	return &proxy.ConnectResponse{Ok: true}, nil
}

func (s *Proxy) Tunnel(stream proxy.Proxy_TunnelServer) error {

	log.Info().Msg("New tunnel stream connected")

	// parse first message
	in, err := stream.Recv()
	if err == io.EOF {
		return nil
	}

	if err != nil {
		log.Error().Err(err).Msg("recv err")
		return err
	}

	tunnelId := in.StreamId
	tunnel := newTunnel(tunnelId, stream)
	s.tunnels[tunnelId] = tunnel

	log.Debug().Msg("opened new tunnel: " + tunnelId)

	<-tunnel.closed
	delete(s.tunnels, tunnelId)
	log.Debug().Msg("closed tunnel: " + tunnelId)
	return nil
}
