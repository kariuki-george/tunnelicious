package main

import (
	"net"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jmoiron/sqlx"
	agent "github.com/kariuki-george/tunnelicious/gen/proto"
	"github.com/kariuki-george/tunnelicious/internal/control"
	_ "github.com/mattn/go-sqlite3"
	"github.com/rs/zerolog/log"
	"google.golang.org/grpc"
)

func main() {
	log.Info().Msg("starting server")

	db, err := sqlx.Connect("sqlite3", "local.db")

	if err != nil {
		log.Fatal().Err(err).Msg("cannot connect to db")
	}

	ctrl := control.NewController(db)

	// start response api

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {

		w.Write([]byte("ok\n"))
	})

	go func() {

		log.Info().Msg("http server listening on port 20420")
		http.ListenAndServe(":20420", r)

	}()

	// grpc control server

	lis, err := net.Listen("tcp", ":21420")
	if err != nil {
		log.Fatal().Err(err).Msg("fauled to open grpc listener")
	}

	s := grpc.NewServer()
	agent.RegisterControlServer(s, ctrl)
	log.Info().Msg("grpc server listening on port 21420")

	if err := s.Serve(lis); err != nil {
		log.Fatal().Err(err).Msg("failed to serve grpc")
	}
}
