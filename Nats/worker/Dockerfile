FROM golang
WORKDIR /go/src/app

COPY worker.go /go/src/app
#COPY start.sh /app
#RUN ["chmod", "+x", "/app/publisher.go"]
#RUN ["chmod", "+x", "/app/start.sh"]
CMD ["go","build","worker.go"]
EXPOSE 8080
ENTRYPOINT ["/go/worker"]


FROM golang
RUN go get github.com/nats-io/nats.go
COPY . /go
CMD ["go","build","worker.go"]
EXPOSE 8080
ENTRYPOINT ["/go/worker"]

