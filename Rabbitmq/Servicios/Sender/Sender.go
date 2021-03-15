package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/streadway/amqp"
)

//Manejo de errores
func error_(err error, msg string) {
	if err != nil {
		log.Fatal("%s: $s", msg, err)
	}
}

//Nuevo elemento entrando a la peticion
func nuevo_(w http.ResponseWriter, r *http.Request) {
	//Se agrega el nuevo
	w.Header().Set("Content-Type", "application/json")

	//parseando el cuerpo
	var body map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&body)
	error_(err, "parseando Json")
	body["way"] = "RabbitMQ"
	data, err := json.Marshal(body)

	//Conectando al servidor
	conn, err := amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
	error_(err, "Coneccion con RabbitMQ")
	defer conn.Close()

	//Abriendo Canal de Conexion
	ch, err := conn.Channel()
	error_(err, "Nuevo canal de conexion")
	defer ch.Close()

	//Declarando una nueva cola
	q, err := ch.QueueDeclare(
		"RabbitUsers", //Nombre de la cola
		false,         //si es durable
		false,         // borrar cuando no se usa
		false,         //exclusiva
		false,         //no perdura en el tiempo
		nil,           //tiene algun otro tipo de argumentos
	)
	error_(err, "Fallo al Crear a Cola")

	//Publicando un nuevo mensaje
	nuevo := string(data)
	err = ch.Publish(
		"",     //intercambio o exchange no hay
		q.Name, //clave de routeo nombre cola
		false,  //mandatario
		false,  //inmediato
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(nuevo),
		})
	error_(err, "Fallo al Publicar un Mensaje")
	log.Printf(" [x] Sent %s", nuevo)

	//Header que nos dice que todo paso bien y la data
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(nuevo))
}

//Maneja la peticion
func solicitud_() {
	http.HandleFunc("/", nuevo_)
	log.Fatal(http.ListenAndServe(":3000", nil))
}

func main() {
	solicitud_()
}
