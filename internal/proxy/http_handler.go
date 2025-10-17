package proxy

import (
	"bufio"
	"bytes"
	"io"
	"net/http"
	"strings"

	"github.com/lucsky/cuid"
	"github.com/rs/zerolog/log"
)

func (p *Proxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	tunnelId := extractSubDomain(r.Host)

	tunnel, ok := p.tunnels[tunnelId]

	if !ok {
		http.Error(w, "no active tunnel", http.StatusNotFound)
		return
	}

	// req -> frame chunk

	streamId := cuid.New()
	// another alternative implementation is to frame the http request
	buf := new(bytes.Buffer)
	err := r.Write(buf)

	if err != nil {
		http.Error(w, "unable to read request", 400)
		return
	}

	// send to agent

	if err := tunnel.Send(buf.Bytes(), streamId, false); err != nil {
		http.Error(w, "tunnel send error", 500)
		return
	}

	// get agent response
	data, err := tunnel.Receive(streamId)
	if err != nil {
		log.Error().Err(err).Msg("tunnelicious failed to handle request to completion")
		http.Error(w, "tunnel recv error", 500)
		return
	}

	resp, err := http.ReadResponse(bufio.NewReader(bytes.NewBuffer(data)), r)

	if err != nil {
		return
	}
	defer resp.Body.Close()
	for k, v := range resp.Header {
		for _, vv := range v {
			w.Header().Add(k, vv)
		}
	}

	// 5. Write status code
	w.WriteHeader(resp.StatusCode)

	// 6. Stream body
	if _, err := io.Copy(w, resp.Body); err != nil {
		log.Warn().Err(err).Msg("client disconnected before full response")
	}
	return
}

func extractSubDomain(host string) string {
	parts := strings.Split(host, ".")
	if len(parts) > 2 {
		return parts[0]
	}
	return ""
}
