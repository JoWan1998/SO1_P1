package main

import (
	"bytes"
	"io/ioutil"
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

func conection() {
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

	//Se declara un nuevo consumer
	msgs, err := ch.Consume(

		q.Name, //cola
		"",     //consumer
		true,   //auto-ack
		false,  //exclusivo
		false,  //no local
		false,  //no espera
		nil,    //no tiene argumentos
	)
	error_(err, "Fallo al Registrar Consumer")

	//Reciviendo mensajes en forma de loop siempre va a ejecutarse
	forever := make(chan bool)
	//Declaramos una go rutina en la que se va ejecutar siempre
	go func() {
		for d := range msgs {
			log.Printf("Mensage Recibido: %s", d.Body)
			post := []byte(string(d.Body))                                                          //convertimos a una cadena de bytes
			req, err := http.Post("http://mongos:5000/", "application/json", bytes.NewBuffer(post)) //hacemos la peticion a la bd
			req.Header.Set("Content-Type", "application/json")
			error_(err, "Post nuevo documento")
			defer req.Body.Close() // cerramos el body

			//Leyendo la respuesta del cuerpo
			nuevo, err := ioutil.ReadAll(req.Body) //se convierte en cadena
			error_(err, "Leyendo Respuesta desde el Post Http")
			sb := string(nuevo) //lo transformamos en una cadena
			log.Printf(sb)      //imprimimos
		}
	}()
	log.Printf("[*] Esperado por mensages, para salir es con CTRL+C")
	<-forever //aqui finaliza el bucle
}

func main() {
	conection()
}
