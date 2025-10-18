package control

import (
	"context"

	"github.com/jmoiron/sqlx"
	agent "github.com/kariuki-george/tunnelicious/gen/proto"
	"github.com/lucsky/cuid"
	"github.com/rs/zerolog/log"
)

type Controller struct {
	db *sqlx.DB
	agent.UnimplementedControlServer
}

func NewController(db *sqlx.DB) *Controller {
	return &Controller{db: db}
}

func (c *Controller) RegisterAgent(ctx context.Context, req *agent.RegisterRequest) (*agent.RegisterResponse, error) {
	log.Info().Msgf("RegisterAgent: agent=%s mode=%s", req.Token, req.Mode)
	return &agent.RegisterResponse{Ok: true, AssignedSubdomain: cuid.Slug()}, nil
}

func (c *Controller) Heartbeat(ctx context.Context, hb *agent.HeartbeatRequest) (*agent.HeartbeatResponse, error) {
	log.Info().Msgf("Heartbeat from %s", hb.AgentId)
	return &agent.HeartbeatResponse{Ok: true}, nil
}
