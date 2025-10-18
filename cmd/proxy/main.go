package main

import (
	"net/http"
	"strings"

	agent "github.com/kariuki-george/tunnelicious/gen/proto"
	"github.com/kariuki-george/tunnelicious/internal/control"
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

	ctrl := control.NewController(nil)

	agent.RegisterProxyServer(s, proxy)
	agent.RegisterControlServer(s, ctrl)

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok\n"))
	})

	mux.HandleFunc("/", proxy.ServeHTTP)

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Info().Msgf("Request: Proto=%d, Content-Type=%s, Path=%s",
			r.ProtoMajor, r.Header.Get("Content-Type"), r.URL.Path)
		if r.ProtoMajor == 2 && strings.HasPrefix(r.Header.Get("Content-Type"), "application/grpc") {
			s.ServeHTTP(w, r)
		} else {
			mux.ServeHTTP(w, r)
		}
	})

	h2cHandler := h2c.NewHandler(handler, &http2.Server{})

	log.Info().Msg("proxy listening on :20420")

	err := http.ListenAndServe(":20420", h2cHandler)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to serve proxy")
	}
}
