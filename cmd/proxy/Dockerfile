ARG GO_VERSION=1
FROM golang:${GO_VERSION}-bookworm AS builder

WORKDIR /usr/src/app
COPY go.mod go.sum ./
RUN go mod download && go mod verify
COPY . .
ENV CGO_ENABLED=0 
RUN go build -ldflags "-s -w" -v -o /proxy ./cmd/proxy/main.go

FROM alpine:latest

COPY --from=builder /proxy /usr/local/bin/
EXPOSE 20420
CMD ["proxy"]
