FROM golang

WORKDIR /Server2

COPY . /Server2

RUN go get -u cloud.google.com/go/pubsub
RUN go get -u github.com/tidwall/sjson

ENV GOOGLE_APPLICATION_CREDENTIALS="clave.json"

CMD [ "go", "run", "async_pull.go"]
