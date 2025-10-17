
ctrlplane_dev: 
	@go run cmd/ctrlplane/main.go

agent_dev:
	@go run cmd/tunnelicious/main.go 


proxy_dev:
	@go run cmd/proxy/main.go

dev: 
	@make -s server_dev
	@make -s proxy_dev 
	@make -s agent_dev


gen-proto:
	@protoc --go_out=gen --go-grpc_out=gen proto/*.proto 


install-proto-apt:
	@sudo apt update
	@sudo apt install -y protobuf-compiler 
	@make -s install-go-plugins

install-proto-brew:
	@brew install protobuf
	@make -s install-go-plugins

install-go-plugins:
	@go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
	@go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
	@export PATH="$PATH:$(go env GOPATH)/bin"

register-dns:
	@echo 127.0.0.1 test1.tunnel.local >> /etc/hosts 
	@echo 127.0.0.1 test2.tunnel.local>> /etc/hosts
