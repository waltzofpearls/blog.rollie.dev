---
title: "gRPC with Mutual TLS Between Go and Python"
date: 2019-10-03T17:00:07-07:00
tags: ["Tech", "gRPC", "Go", "Python", "SSL", "TLS"]
draft: false

ogURL: https://blog.rollie.dev/posts/grpc-over-tls-between-go-and-python/
image: https://blog.rollie.dev/images/grpc-over-tls-between-go-and-python/microservices.jpg
description: >
  In a recent project, I used gRPC over TLS between two services written in Go and Python.
  Writing TLS secured gRPC server and client in Go was effortless since it's well covered
  with documentation. Plenty of blog posts and Stack Overflow answers on that topic. However,
  finding a workable example for Python + mTLS was very difficult. Once I figured out
  how to make it work, I feel obliged to document all the findings in a blog post.
---

<center>
  ![Microservices](/images/grpc-over-tls-between-go-and-python/microservices.jpg)
</center>

**TL;DR**
<a href="https://github.com/waltzofpearls/grpc-mtls-go-python" rel="external">Show me the code!</a>

In a recent project, I used gRPC over TLS between two services written in Go and Python.
Writing TLS secured gRPC server and client in Go was effortless since it's well covered
with documentation. Plenty of blog posts and Stack Overflow answers on that topic. However,
finding a workable example for Python + mTLS was very difficult. Once I figured out
how to make it work, I feel obliged to document all the findings in a blog post.

<!--more-->

### Mutual TLS in gRPC

First things first, what is TLS auth in gRPC, and what is mutual TLS?

> gRPC has SSL/TLS integration and promotes the use of SSL/TLS to authenticate the server,
and to encrypt all the data exchanged between the client and the server. Optional mechanisms
are available for clients to provide certificates for mutual authentication.

https://grpc.io/docs/guides/auth/

> Mutual TLS authentication ensures that traffic is both secure and trusted in both directions
between a client and server. mTLS can be used for allowing requests that do not login with an
identity provider, like IoT devices, to demonstrate that they can reach a given resource.
Client certificate authentication can also be used as a second layer of security for team members
who both login with an identity provider and present a valid client certificate.

https://developers.cloudflare.com/access/service-auth/mtls/

### Create CA, server and client certificates

In mTLS, we will need certificates for both server and client. A CA certificate is also
needed to sign the certs. To help generate everything required, let's install
<a href="https://github.com/square/certstrap" rel="external">certstrap</a> tool by running
`brew install certstrap` on macOS or follow
<a href="https://github.com/square/certstrap#building" rel="external">this instruction</a>
to build from source on other OS.

Once certstrap is installed, we can generate a root CA by:

```bash
certstrap --depot-path certs init --common-name "gRPC Root CA"
```

It will create 3 files in `certs` folder:

- `certs/gRPC_Root_CA.key`
- `certs/gRPC_Root_CA.crt`
- `certs/gRPC_Root_CA.crl`

Next, let's generate a certificate request for gRPC server. Use SAN (`--domain` or `--ip`)
to create a request that matches server's host (`localhost` in the context of this blog post).

```bash
certstrap --depot-path certs request-cert --domain localhost
```

It will create the following 2 files:

- `certs/localhost.key`
- `certs/localhost.csr`

For gRPC client side cert request, use common name or SAN with an arbitrary name.

```bash
certstrap --depot-path certs request-cert --cn grpc_client
```

Another 2 files generated:

- `certs/grpc_client.key`
- `certs/grpc_client.csr`

Lastly, let's sign the server and client cert requests with our CA cert.

```bash
certstrap --depot-path certs sign --CA "gRPC Root CA" localhost
certstrap --depot-path certs sign --CA "gRPC Root CA" grpc_client
```

And 2 cert files will be created as follows:

- `certs/localhost.crt`
- `certs/grpc_client.crt`

### Install dependencies for gRPC Go and Python

Go and Python require their own language specific libraries and tools for gRPC, and they both
are dependent on `protobuf`.

**Go:** Install Go support for Protocol Buffers and gRPC-Go.

```bash
# only on macOS
# other OS see: https://github.com/golang/protobuf#installation
brew install protobuf

# install proto file compiler plugin for Go
go get -u github.com/golang/protobuf/protoc-gen-go

# install these deps in a Go module folder (with go.mod)
go get -u github.com/golang/protobuf
go get -u google.golang.org/grpc
```

**Python:** Create a new virtualenv project, and then install deps.

```bash
pip install grpcio grpcio-tools
```

### Define a simple service in proto3

In `api/metrics.proto`, let's define a `Metrics` sevice with a `Query` function that fetches
metrics by name, labels, starting and ending dates. It will return an array of metrics.
In addition to metric name and labels, each returned metric will include a list of timestamp
and value sample pairs.

```protobuf
syntax = "proto3";

package api;

import "google/protobuf/timestamp.proto";

service Metrics {
  rpc Query (QueryMetricsRequest) returns (QueryMetricsResponse);
}

message QueryMetricsRequest {
  string metricName = 1;
  map<string, string> labels = 2;
  google.protobuf.Timestamp start = 3;
  google.protobuf.Timestamp end = 4;
}

message QueryMetricsResponse {
  repeated Metric metrics = 1;
}

message Metric {
  string name = 1;
  map<string, string> labels = 2;

  message SamplePair {
    google.protobuf.Timestamp time = 1;
    double value = 2;
  }

  repeated SamplePair values = 3;
}
```

### Generate Go and Python code from the proto file

Run the following two commands:

```bash
# Go
protoc --go_out=plugins=grpc:. api/*.proto

# Python
python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. api/*.proto
```

And these Go and Python files will be generated in `api` folder from `api/metrics.proto`:

- `api/metrics.pb.go`
- `api/metrics_pb2.py`
- `api/metrics_pb2_grpc.py`

### Go gRPC server

In `server.go`, we begin by defining a `server` struct with fields for gRPC server address,
CA cert, server side TLS key and cert. This struct will later be registered as a gRPC server.

```go
type server struct {
	tlsCert []byte
	tlsKey  []byte
	rootCA  []byte
	address string
}

func newServer() *server {
	return &server{
		tlsCert: []byte(os.Getenv("TLS_SERVER_CERT")),
		tlsKey:  []byte(os.Getenv("TLS_SERVER_KEY")),
		rootCA:  []byte(os.Getenv("TLS_ROOT_CA")),
		address: os.Getenv("GRPC_SERVER_ADDRESS"),
	}
}
```

`newServer()` function creates a new instnace of `server` struct. Field values are read from
environment variables.

Next let's attach a `run()` method. It creates a gRPC server with all the TLS configurations
wrapped in `tlsServerOption()` method and passed into the gRPC server as an option. At the
end of the `run()` method, it listens to `GRPC_SERVER_ADDRESS` and blocks the main goroutine
while it's serving the gRPC server on all incoming requests.

```go
func (s *server) run() error {
	listen, err := net.Listen("tcp", s.address)
	if err != nil {
		return fmt.Errorf("could not listen to %s %v", s.address, err)
	}

	serverOption, err := s.tlsServerOption()
	if err != nil {
		return err
	}

	grpcServer := grpc.NewServer(serverOption)
	api.RegisterMetricsServer(grpcServer, s)

	log.Println("Starting gRPC server", s.address)
	return grpcServer.Serve(listen)
}

func (s *server) tlsServerOption() (grpc.ServerOption, error) {
	certPool := x509.NewCertPool()
	if !certPool.AppendCertsFromPEM(s.rootCA) {
		return nil, errors.New("failed to append root CA cert")
	}
	certificate, err := tls.X509KeyPair(s.tlsCert, s.tlsKey)
	if err != nil {
		return nil, fmt.Errorf("failed load server TLS key and cert: %s", err)
	}
	tlsConfig := &tls.Config{
		ClientAuth:   tls.RequireAndVerifyClientCert,
		Certificates: []tls.Certificate{certificate},
		ClientCAs:    certPool,
	}

	return grpc.Creds(credentials.NewTLS(tlsConfig)), nil
}
```

In `run()` method, it registers all exported methods from `server` struct as RPC request handlers.

`Query()` method implements `Query` function defined in `metrics.proto`, and it's registered as
a RPC request handler. In this example, it doesn't read any incoming request parameters, and it
only returns a hardcoded dummy metric.

```go
func (s *server) Query(ctx context.Context, req *api.QueryMetricsRequest) (*api.QueryMetricsResponse, error) {
	timestamp, _ := ptypes.TimestampProto(time.Now())
	return &api.QueryMetricsResponse{
		Metrics: []*api.Metric{
			&api.Metric{
				Name: "steps",
				Labels: map[string]string{
					"some":    "label",
					"another": "one",
				},
				Values: []*api.Metric_SamplePair{
					&api.Metric_SamplePair{
						Time:  timestamp,
						Value: 5500,
					},
				},
			},
		},
	}, nil
}
```

Now let's create a new `server`, and run it in the `main()` function.

```go
package main

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"log"
	"net"
	"os"
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/waltzofpearls/grpc-mtls-go-python/api"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

func main() {
	s := newServer()
	s.run()
}
```

Finally,
<a href="https://github.com/waltzofpearls/grpc-mtls-go-python/blob/master/server.go" rel="external">putting it all together</a>,
and we have a gRPC server.

### Python gRPC client

On the client side, first we add a `Client` class in `client.py` with a `fetch()` method.
It calls RPC `Query` function with CA cert, client side key and cert configured as credentials.
In this particular example, it tries to query metrics for the last 24 hours.

```python
import api.metrics_pb2
import api.metrics_pb2_grpc
import grpc
import os
from google.protobuf.timestamp_pb2 import Timestamp
from google.protobuf.duration_pb2 import Duration
from datetime import datetime, timedelta

class Client:
    def __init__(self):
        self.root_ca = os.environ.get('TLS_ROOT_CA', '').encode()
        self.tls_key = os.environ.get('TLS_CLIENT_KEY', '').encode()
        self.tls_cert = os.environ.get('TLS_CLIENT_CERT', '').encode()
        self.address = os.environ.get('GRPC_SERVER_ADDRESS', '')

    def fetch(self):
        try:
            credentials = grpc.ssl_channel_credentials(
                self.root_ca, self.tls_key, self.tls_cert)
            channel = grpc.secure_channel(self.address, credentials)
            stub = api.metrics_pb2_grpc.MetricsStub(channel)

            end_dt = datetime.now()
            start_dt = end_dt - timedelta(hours=24)

            start_ts, end_ts = Timestamp(), Timestamp()
            start_ts.FromDatetime(start_dt)
            end_ts.FromDatetime(end_dt)

            req = api.metrics_pb2.QueryMetricsRequest(
                metricName='steps',
                start=start_ts,
                end=end_ts
            )
            resp = stub.Query(req)
            return resp
        except Exception as e:
            print('ERROR:', e)
            return None
```

Calling the `fetch()` method, and printing the response from gRPC server.

```python
if __name__ == "__main__":
    c = Client()
    metrics = c.fetch()
    print(metrics)
```

Let's
<a href="https://github.com/waltzofpearls/grpc-mtls-go-python/blob/master/client.py" rel="external">put it all together</a>
as a gRPC client.

### Conclusion

It's always a good practice to enable SSL/TLS everywhere, including all the public and internal
services. Hopefully this blog post will serve as a good documentation to mutual TLS in gRPC between
two different languages particularly in Go and Python. In large distributed systems, we will need
a better certificate management service to make TLS everywhere a reality. However, it's out of the
scope of this blog post.

For a full example of mTLS + gRPC + Go + Python, check out
<a href="https://github.com/waltzofpearls/grpc-mtls-go-python" rel="external">github.com/waltzofpearls/grpc-mtls-go-python</a>.
