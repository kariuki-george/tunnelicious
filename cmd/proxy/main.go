package main

import (
	agent "github.com/kariuki-george/tunnelicious/gen/proto"
	"github.com/kariuki-george/tunnelicious/internal/proxy"
	"github.com/rs/zerolog/log"
	"google.golang.org/grpc"
	"net"
	"net/http"
)

func main() {
	log.Info().Msg("starting proxy")

	lis, err := net.Listen("tcp", ":22420")
	if err != nil {
		log.Fatal().Err(err).Msg("proxy grpc failed to listen")
	}

	s := grpc.NewServer()
	proxy := proxy.NewProxy()
	agent.RegisterProxyServer(s, proxy)

	log.Info().Msg("proxy grpc server listening :22420")

	go func() {
		err = s.Serve(lis)
		if err != nil {
			log.Fatal().Err(err).Msg("failed to serve proxy")
		}
	}()

	mux := http.NewServeMux()

	mux.HandleFunc("/", proxy.ServeHTTP)

	log.Info().Msg("proxy listening on :23420")

	err = http.ListenAndServe(":23420", mux)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to serve proxy")
	}
}
