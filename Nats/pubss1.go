package main

import (
  "fmt"
  "log"
  "net/http"
  "os"
  "time"
  "encoding/json"

  "github.com/nats-io/go-nats"
)

type server struct {
  nc *nats.Conn
}

//MANEJO DE ERRORES
func error_(err error, msg string) {
        if err != nil {
                log.Fatal("%s: $s", msg, err)
        }
}


func (s server) Persons(w http.ResponseWriter, r *http.Request) {
	fmt.Println(w, "OK")
}

func (s server) createTask(w http.ResponseWriter, r *http.Request) {
	requestAt := time.Now()
	data := json.Marshal(r.Body)
	datos := string(data)
	response, err := s.nc.Request("tasks", []byte(datos), 5*time.Second)
	if err != nil {
	  log.Println("Error making NATS request:", err)
	}
	duration := time.Since(requestAt)
  
	fmt.Fprintf(w, "Task scheduled in %+v\nResponse: %v\n", duration, string(response.Data))
  }


func main() {
	
	var s server
	var err error
	uri := os.Getenv("NATS_URI")
  
	for i := 0; i < 5; i++ {
	  nc, err := nats.Connect(uri)
	  if err == nil {
		s.nc = nc
		break
	  }
  
	  fmt.Println("Waiting before connecting to NATS at:", uri)
	  time.Sleep(1 * time.Second)
	}
	if err != nil {
	  log.Fatal("Error establishing connection to NATS:", err)
	}
  
	fmt.Println("Connected to NATS at:", s.nc.ConnectedUrl())
	
	http.HandleFunc("/", s.createTask)
	http.HandleFunc("/person", s.Persons)
	fmt.Println("Server listening on port 3000...")
	if err := http.ListenAndServe(":3000", nil); err != nil {
	  log.Fatal(err)
	}
}
