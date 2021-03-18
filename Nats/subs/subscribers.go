package main

import (
  "fmt"
  "log"
  "net/http"
  "os"
  "time"
  "bytes"
  "io/ioutil" 

  "github.com/nats-io/go-nats"
)

func Persons(w http.ResponseWriter, r *http.Request) {
	fmt.Println(w, "OK")
}

//Manejo de errores
func error_(err error, msg string) {
	if err != nil {
		log.Fatal("%s: $s", msg, err)
	}
}

func main() {
	uri := os.Getenv("NATS_URI")
	var err error
	var nc *nats.Conn

	for i := 0; i < 5; i++ {
		nc, err = nats.Connect(uri)
		if err == nil {
			break
		}

		fmt.Println("Waiting before connecting to NATS at:", uri)
		time.Sleep(1 * time.Second)
	}

	if err != nil {
		log.Fatal("Error establishing connection to NATS: %s", uri, err)
	}

	fmt.Println("Connected to NATS at:", nc.ConnectedUrl())
	nc.Subscribe("tasks", func(m *nats.Msg) {
		fmt.Println("Got task request on:", m.Subject)
		nc.Publish(m.Reply, []byte(m.Data))
		log.Printf("Mensage Recibido: %s", m.Data)
		post := []byte(string(m.Data))                                                          //convertimos a una cadena de bytes
		req, err := http.Post("http://35.222.55.115:8080/nuevoRegistro", "application/json", bytes.NewBuffer(post)) //hacemos la peticion a la bd
		req.Header.Set("Content-Type", "application/json")
		error_(err, "Post nuevo documento")
		defer req.Body.Close() // cerramos el body

		//Leyendo la respuesta del cuerpo
		nuevo, err := ioutil.ReadAll(req.Body) //se convierte en cadena
		error_(err, "Leyendo Respuesta desde el Post Http")
		sb := string(nuevo) //lo transformamos en una cadena
		log.Printf(sb)      //imprimimos
	})

	fmt.Println("Worker subscribed to 'tasks' for processing requests...")
	fmt.Println("Server listening on port 8181...")

	http.HandleFunc("/person", Persons)

	if err := http.ListenAndServe(":8181", nil); err != nil {
		log.Fatal(err)
	}
}
