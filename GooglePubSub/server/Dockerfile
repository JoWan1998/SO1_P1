FROM golang

WORKDIR /Server1

COPY . /Server1

RUN go get -u cloud.google.com/go/pubsub
RUN go get -u github.com/tidwall/sjson

EXPOSE 8080

ENV GOOGLE_APPLICATION_CREDENTIALS="clave.json"

CMD [ "go", "run", "publish_scale.go"]
