package proxy

import (
	"fmt"
	"sync"
	"time"

	proxy "github.com/kariuki-george/tunnelicious/gen/proto"
	"github.com/rs/zerolog/log"
)

type Tunnel interface {
	Send(data []byte, streamId string, fin bool) error
	Receive(streamId string) ([]byte, error)
	Close() error
}

type tunnel struct {
	id     string
	stream proxy.Proxy_TunnelServer
	sendMu sync.Mutex

	responses map[string]chan *proxy.StreamChunk
	closed    chan struct{}
	closeOnce sync.Once
}

func newTunnel(id string, ps proxy.Proxy_TunnelServer) *tunnel {
	s := &tunnel{
		id:        id,
		stream:    ps,
		responses: make(map[string]chan *proxy.StreamChunk),
		closed:    make(chan struct{}),
	}
	go s.listen()
	go s.lifetimeLimiter()
	return s
}

func (t *tunnel) lifetimeLimiter() {
	time.Sleep(time.Minute * 10)
	t.Close()
}

func (t *tunnel) listen() {

	for {

		chunk, err := t.stream.Recv()

		if err != nil {
			log.Info().Str("agent_id", t.id).Msg("agent disconnected")
			t.Close()
			return
		}

		rchan, ok := t.responses[chunk.StreamId]
		if !ok {
			log.Error().Msg("expected stream chan for response. none found")
			continue
		}
		rchan <- chunk
	}
}

func (t *tunnel) Send(data []byte, streamId string, fin bool) error {
	t.sendMu.Lock()
	defer t.sendMu.Unlock()

	err := t.stream.Send(&proxy.StreamChunk{StreamId: streamId, Payload: data, Fin: fin})
	if err != nil {
		return err
	}

	rchan := make(chan *proxy.StreamChunk, 1)
	t.responses[streamId] = rchan
	return nil
}

func (t *tunnel) Receive(streamId string) ([]byte, error) {
	rchan, ok := t.responses[streamId]
	if !ok {
		log.Error().Msg("expected stream chan for response. none found")
		return nil, fmt.Errorf("something went wrong")
	}

	select {
	case <-t.closed:
		// not sure what to forward to user
		return nil, fmt.Errorf("sorry, tunnelicious could not fulfil this request")
	case m := <-rchan:
		return m.Payload, nil
	}

}

func (t *tunnel) Close() error {

	t.closeOnce.Do(func() { close(t.closed) })

	return nil
}
