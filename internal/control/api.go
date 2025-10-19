package control

import (
	"context"
	"encoding/json"
	"fmt"
	"io"

	"github.com/hashicorp/go-retryablehttp"
	agent "github.com/kariuki-george/tunnelicious/gen/proto"
	"github.com/rs/zerolog/log"
)

type Controller struct {
	agent.UnimplementedControlServer
	cfg *Config
}
type CtrlResponse struct {
	Message string `json:"message"`
	Tunnel  struct {
		TunnelId string `json:"tunnelId"`
	} `json:"tunnel"`
}

func NewController(cfg *Config) *Controller {
	return &Controller{cfg: cfg}
}

func (c *Controller) RegisterAgent(ctx context.Context, r *agent.RegisterRequest) (*agent.RegisterResponse, error) {
	log.Info().Msgf("RegisterAgent: agent=%s mode=%s", r.Token, r.Mode)

	if r.Token == "" {
		return nil, fmt.Errorf("invalid token provided")
	}

	req, err := retryablehttp.NewRequest("GET", fmt.Sprintf("%s/api/ctrl", c.cfg.CtrlPlane.String()), nil)

	if err != nil {
		return nil, fmt.Errorf("could not register agent. %w", err)
	}

	req.Header.Set("authorization", fmt.Sprintf("Bearer %s", c.cfg.ProxySecret))
	req.Header.Set("x-api-key", r.Token)
	req.Header.Set("Content-Type", "application/json")

	client := retryablehttp.NewClient()

	resp, err := client.Do(req.WithContext(ctx))
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		if body, err := io.ReadAll(resp.Body); err == nil {
			log.Info().Msg(string(body))
		}

		return nil, fmt.Errorf("controlplane rejected auth: %s", resp.Status)
	}

	var parsed CtrlResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}
	return &agent.RegisterResponse{Ok: true, AssignedSubdomain: parsed.Tunnel.TunnelId}, nil
}

func (c *Controller) Heartbeat(ctx context.Context, hb *agent.HeartbeatRequest) (*agent.HeartbeatResponse, error) {
	log.Info().Msgf("Heartbeat from %s", hb.AgentId)
	return &agent.HeartbeatResponse{Ok: true}, nil
}
