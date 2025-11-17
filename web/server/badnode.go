package badnodeapi

import (
	"context"
	"log"
	badnode "badnode/gen/badnode"

	"crypto/tls"
	"bytes"
    "encoding/json"
    "io"
    "io/ioutil"
    "net/http"
    "time"
)

// badnode service example implementation.
// The example methods log the requests and return zero values.
type badnodesrvc struct {
	logger *log.Logger
	windowMap *map[string]string
}


// NewBadnode returns the badnode service implementation.
func NewBadnode(logger *log.Logger) badnode.Service {
	var windowMapObj = make(map[string]string)
	var windowMapObj_p = &windowMapObj
	return &badnodesrvc{logger, windowMapObj_p,}
}