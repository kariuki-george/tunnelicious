package main

import (
	"net/http"
	"strings"

	agent "github.com/kariuki-george/tunnelicious/gen/proto"
	"github.com/kariuki-george/tunnelicious/internal/proxy"
	"github.com/rs/zerolog/log"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"google.golang.org/grpc"
)

func main() {
	log.Info().Msg("starting proxy")

	s := grpc.NewServer()
	proxy := proxy.NewProxy()
	agent.RegisterProxyServer(s, proxy)

	mux := http.NewServeMux()

	mux.HandleFunc("/", proxy.ServeHTTP)

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		if r.ProtoMajor == 2 && strings.HasPrefix(r.Header.Get("Content-Type"), "application/grpc") {
			s.ServeHTTP(w, r)
		} else {
			mux.ServeHTTP(w, r)

		}
	})

	h2cHandler := h2c.NewHandler(handler, &http2.Server{})

	log.Info().Msg("proxy listening on :22420")

	err := http.ListenAndServe(":22420", h2cHandler)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to serve proxy")
	}
}
