package main

import (
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jmoiron/sqlx"
	agent "github.com/kariuki-george/tunnelicious/gen/proto"
	"github.com/kariuki-george/tunnelicious/internal/control"
	_ "github.com/mattn/go-sqlite3"
	"github.com/rs/zerolog/log"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"google.golang.org/grpc"
)

func main() {
	log.Info().Msg("starting server")

	db, err := sqlx.Connect("sqlite3", "local.db")

	if err != nil {
		log.Fatal().Err(err).Msg("cannot connect to db")
	}

	ctrl := control.NewController(db)

	// grpc control server

	s := grpc.NewServer()
	agent.RegisterControlServer(s, ctrl)

	// start response api

	chir := chi.NewRouter()
	chir.Use(middleware.Logger)
	chir.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok\n"))
	})

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		if r.ProtoMajor == 2 && strings.HasPrefix(r.Header.Get("Content-Type"), "application/grpc") {
			s.ServeHTTP(w, r)
		} else {
			chir.ServeHTTP(w, r)

		}
	})

	log.Info().Msg("control plane listening on port 20420")

	h2cHandler := h2c.NewHandler(handler, &http2.Server{})
	http.ListenAndServe(":20420", h2cHandler)
	if err != nil {
		log.Fatal().Msgf("Server failed to start: %v", err)
	}
}
