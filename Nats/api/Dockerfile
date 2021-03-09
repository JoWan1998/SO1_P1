FROM golang
WORKDIR /go/src/app
RUN go get github.com/nats-io/nats.go
COPY api-server.go /go/src/app
#COPY start.sh /app
#RUN ["chmod", "+x", "/app/publisher.go"]
#RUN ["chmod", "+x", "/app/start.sh"]
CMD ["go","build","api-server.go"]
EXPOSE 8080
ENTRYPOINT ["/go/api-server"]



FROM golang
RUN go get github.com/nats-io/nats.go
COPY . /go
CMD ["go","build","api-server.go"]
EXPOSE 8080
ENTRYPOINT ["/go/api-server"]