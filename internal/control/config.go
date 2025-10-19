package control

import "net/url"

type Config struct {
	CtrlPlane   url.URL `env:"CTRL_PLANE_URL,required"`
	ProxySecret string  `env:"PROXY_SECRET,required"`
}
