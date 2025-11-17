package design

import (
	. "goa.design/goa/v3/dsl"
)

var _ = API("badnode", func() {
	Title("BadNode Service")
	Description("Evm node status website services")
    Server("badnode", func() {
        Host("0.0.0.0", func() {
            URI("http://0.0.0.0:9000")
            URI("grpc://0.0.0.0:9001")
			// URI("http://0.0.0.0:30101")
            // URI("grpc://0.0.0.0:30102")
        })
    })
})

var _ = Service("badnode", func() {
	Description("Evm node status website services")

	Files("/openapi.json", "./gen/http/openapi.json")
	Files("/", "./website/index.html")
	Files("/favicon.ico", "./website/favicon.ico")
	Files("/assets/{*filepath}", "./website/assets")
	Files("/icons/{*filepath}", "./website/icons")
})