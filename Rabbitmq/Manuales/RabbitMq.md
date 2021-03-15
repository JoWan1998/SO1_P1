



# MANUAL - RABBIT- PROTOCOLO AMQP(ADVANCED MESSAGE QUEUING PROTOCOL)"

##### por **Jonathan Hidalgo**

-----------------------------------------------------------
>"RabbitMQ es un software de encolado de mensajes llamado bróker de mensajería o gestor de colas. Dicho de forma simple, es un software donde se pueden definir colas,   las aplicaciones se pueden conectar a dichas colas y transferir/leer mensajes en ellas. Sus características principales son:

1. Garantía de entrega	
2. Enrutamiento flexible	
3. Clusterización	
4. Federación	
5. Alta disponibilidad	
6. Tolerancia a fallos


* FUNCIONAMIENTO 
> "La arquitectura básica de una cola de mensajes es simple. Hay aplicaciones clientes, llamadas productores, que crean mensajes y los entregan al intermediario (la cola de mensajes). Otras aplicaciones, llamadas consumidores, se conectan a la cola y se suscriben a los mensajes que se procesarán. Un mensaje puede incluir cualquier tipo de información."

![This is a alt text.](/Imagenes/S1.png "This is a sample image.")



* Flujo de mensajes estándar de RabbitMQ

1. El productor publica un mensaje al exchange
2. El exchange recibe el mensaje y pasa a ser el responsable del enrutamiento del mensaje
3. Se debe establecer un binding entre la cola y el exchange. En el ejemplo, tenemos enlaces a dos colas diferentes desde el exchange. El exchange enruta el mensaje a las colas
4. Los mensajes permanecen en la cola hasta que sean manejados por un consumidor
5. El consumidor procesa el mensaje

![This is a alt text.](/Imagenes/s2.png "This is a sample image.")


* Referencia 
> https://blog.bi-geek.com/rabbitmq-para-principiantes/


-----------------------------------------------------------


En el siguiente manual,Se dividira en 3 partes donde tendremos el servidor de rabbitmq encargado de encolar los mensajes, el servidor  de rabbitMQ encargado de administrar los mensajes y enviarlos al servidor de rabbitmq  llamado sender, el reciver que recibira los mensajes, y si este no tiene señan de red se guardaran en cola hasta que nuevamente se vuelva a tener  la señal para la recepcion de los mensajes. 

1. Servidor RabbitMQ
2. Sender
3. Receiver




## Servidor RabbitMQ

>"A continuacion se Trabajara con una imagen de docker hub, la cual contendra rabbitMQ  y la cual bamos a estar configurando para trabajar:"


1. Entramos ala pagina de docker hub en la que podremos buscar la imagen de rabbit que mejor se adecue a nuestras necesidades.
```
   https://hub.docker.com/_/rabbitmq
```
2. luego teniendo instalado docker descargamos la imagen que hemos seleccionado con  el comando:
```
   docker pull rabbitmq:3-management
```
En este caso esta utilizaremos.


3. Construimos el Contenedor Mapeando los puertos  en una sola linea de comando.

```
  docker run -it –-rm –-name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

4. Puertos que fueron mapeados a los puertos del server.

Se implemento un intermediario entre rabbitmq:
```
-p 5672:5672 
```
Como también el puerto para el manager 
```
-p 15672:15672
```

5. con esto tenemos  corriendo un contenedor con RabbitMQ configurado y listo para utilizar:

## Sender

> Paquetes que necesitamos importar 
```
  import (
    "encoding/json"
    "log"
    "net/http"
    "github.com/streadway/amqp"   // paquete que importamos de Rabbir con un simple   "go get github.com/streadway/amqp" 
  )
```
> Manejo  de Errores 
```
  func error_(err error, msg string) {
    if err != nil {
      log.Fatal("%s: $s", msg, err)
    }
  }

```



> Funcion que manejara el nuevo mensaje Entrante.
```
  func nuevo_(w http.ResponseWriter, r *http.Request)
```
1. tenemos los encabezados para hacer referencia a que el contenido sera de tipo application/json
```
  w.Header().Set("Content-Type", "application/json")
```

2. Parceamos la entrada 

```
	var body map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&body)
	error_(err, "parseando Json")
	body["way"] = "RabbitMQ"
	data, err := json.Marshal(body)
```

3. conectamos con nuestro Contenedor quien tendra el servicio de Rabbit MQ
```
  conn, err := amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
	error_(err, "Coneccion con RabbitMQ")
	defer conn.Close()
```
4. Abrimos el canal de Conexion, como tambien su respectivo error por si falla
```
  ch, err := conn.Channel()
	error_(err, "Nuevo canal de conexion")
	defer ch.Close()
```
5. Declaramos una nueva Cola  Como tambien su respectivo error si esta falla 
```
  q, err := ch.QueueDeclare(
		"RabbitUsers", //Nombre de la cola
		false,         //si es durable
		false,         // borrar cuando no se usa
		false,         //exclusiva
		false,         //no perdura en el tiempo
		nil,           //tiene algun otro tipo de argumentos
	)
	error_(err, "Fallo al Crear a Cola")
```
6. Publicamos el mensaje al servicio de Rabbit, como tambien su respectivo error por si falla.

```
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

```

7. encabezado que nos informan de la transaccion si todo resulto bien como la informacion enviada.

```
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(nuevo))

```

8. Funcion que maneja la peticion en el puerto 3000

```
  func solicitud_() {
    http.HandleFunc("/", nuevo_)
    log.Fatal(http.ListenAndServe(":3000", nil))
  }

```

9. Llamamos la funcion en el main

```
  func main() {
    solicitud_()
  }
```


## Receiver
> Paquetes que necesitamos importar 
```
  import (
    "encoding/json"
    "log"
    "net/http"
    "github.com/streadway/amqp"   // paquete que importamos de Rabbir con un simple   "go get github.com/streadway/amqp" 
  )
```
> Manejo  de Errores 
```
  func error_(err error, msg string) {
    if err != nil {
      log.Fatal("%s: $s", msg, err)
    }
  }

```

> Funcion que manejara la conexion 

```
  func conection()
```

1. Conectamos con el Servidor 

```
	conn, err := amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
	error_(err, "Coneccion con RabbitMQ")
	defer conn.Close()

```

2. Abrimos el canal de conexion

```
	ch, err := conn.Channel()
	error_(err, "Nuevo canal de conexion")
	defer ch.Close()

```

3. Declaramos una nueva cola

```
    q, err := ch.QueueDeclare(
      "RabbitUsers", //Nombre de la cola
      false,         //si es durable
      false,         // borrar cuando no se usa
      false,         //exclusiva
      false,         //no perdura en el tiempo
      nil,           //tiene algun otro tipo de argumentos
    )
    error_(err, "Fallo al Crear a Cola")
```

4. Declaramos un nuevo consumer, quien tomara los mensajes del servidor de  rabbitmq

```
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

```


5. Reciviendo mensajes en forma de loop si los hay.
```
	forever := make(chan bool)
```


6. Se Declara una Subrutina de Go la cual se va a ejecutar siempre , estando atento a alguna actualizacion de mensajes.

```
    go func() {
      for d := range msgs {
        log.Printf("Mensage Recibido: %s", d.Body)
        post := []byte(string(d.Body))                                                          //convertimos a una cadena de bytes
        req, err := http.Post("http://"ip a donde querramos enviar la info":5000/", "application/json", bytes.NewBuffer(post)) 
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

```

7. Se Llama a la funcion 

```
  func main() {
    conection()
  }
```


## Descripcion de los docker file de cada servicio


> "Cuerpo Cada uno de los docker file de los servicios."

1. "Docker File del Receiver"

```
    FROM golang                      // decimos que utilizaremos la imagen de golang 

    WORKDIR /                        //definimos como directorio de trabajo la raiz

    COPY . .                         // copiamos los archivos al container 

    RUN go mod download              //descargamos las dependencias que necesitamos en este modulo 

    EXPOSE 3000                      // exponemos el puerto 3000

    CMD ["go","run","Receiver.go"]   //comando que va a ejecutar para poner a correr todo 
 

```

2. "Docker file del Sender "

```
    FROM golang                  // decimos que utilizaremos la imagen de golang 

    WORKDIR /                    //definimos como directorio de trabajo la raiz

    COPY . .                     // copiamos los archivos al container 

    RUN go mod download          //descargamos las dependencias que necesitamos en este modulo 
 
    EXPOSE 3000                  // exponemos el puerto 3000

    CMD ["go","run","Sender.go"] //comando que va a ejecutar para poner a correr todo

```


> "Cuerpo del Docker Compose que agarra cada uno de los docker file el cual va a comunicar los servicios"

```
  version: "3.3"                       //  Utilizamos la sintaxis 3.3

  services:                            // Servicios que  contendra nuestra contruccion
    rabbitmq:
        image: rabbitmq:3-management   // en este caso tendremos el primer contenedor que tendra la imagen  rabbitMQ 
        ports: 
            - "5672:5672"              // mapeando los puertos del servicio
            - "15672:15672"
    senders: 
        build: ./Sender                // Tendremos el segundo contenedor que tendra la construccion del ambiente del docker file del archivo Sender
        ports: 
          - "8080:3000"                // puerto en el que se mapea el servicio
        depends_on: 
          - rabbitmq                   // decimos que este conectara con rabbitMQ
    receivers:
        build: ./Receiver              // Tendremos el segundo contenedor que tendra la construccion del ambiente del docker file del archivo Receiver
        restart: on-failure            // Este lo tendremos para que cuando falle, vuelva a construir de nuevo 
        depends_on: 
          - rabbitmq                   // decimos que este conectara con rabbitMQ 
```

## Ejecucion  del docker-compose 


> "Luego de crear nuestro archivo, procedemos a construirlo para dicha instruccion ejecutamos el comando en la raiz del archivo:" 

```
    docker-compose up
```






Deben de observar la siguiente salida:

1. Se crearan  los contenedores 

```
  Recreating servicios_rabbitmq_1 ... done
  Recreating servicios_receivers_1 ... done
  Recreating servicios_senders_1   ... done
    
```


2. Empiezan las configuraciones de la imagen con los servicios


```
  receivers_1  | 2021/03/14 21:21:05 %s: $sConeccion con RabbitMQdial tcp 172.19.0.4:5672: connect: connection refused
  receivers_1  | exit status 1
  servicios_receivers_1 exited with code 1
  receivers_1  | 2021/03/14 21:21:07 %s: $sConeccion con RabbitMQdial tcp 172.19.0.4:5672: connect: connection refused
  receivers_1  | exit status 1
  rabbitmq_1   | Configuring logger redirection
  receivers_1  | 2021/03/14 21:21:08 %s: $sConeccion con RabbitMQdial tcp 172.19.0.4:5672: connect: connection refused
  receivers_1  | exit status 1
  servicios_receivers_1 exited with code 1
  receivers_1  | 2021/03/14 21:21:10 %s: $sConeccion con RabbitMQdial tcp 172.19.0.4:5672: connect: connection refused
  receivers_1  | exit status 1
  servicios_receivers_1 exited with code 1
  rabbitmq_1   | 2021-03-14 21:21:11.754 [debug] <0.288.0> Lager installed handler error_logger_lager_h into error_logger
  rabbitmq_1   | 2021-03-14 21:21:11.768 [debug] <0.294.0> Lager installed handler lager_forwarder_backend into rabbit_log_lager_event
  rabbitmq_1   | 2021-03-14 21:21:11.768 [debug] <0.300.0> Lager installed handler lager_forwarder_backend into rabbit_log_connection_lager_event
  rabbitmq_1   | 2021-03-14 21:21:11.768 [debug] <0.306.0> Lager installed handler lager_forwarder_backend into rabbit_log_federation_lager_event
  rabbitmq_1   | 2021-03-14 21:21:11.768 [debug] <0.291.0> Lager installed handler lager_forwarder_backend into error_logger_lager_event
  rabbitmq_1   | 2021-03-14 21:21:11.768 [debug] <0.297.0> Lager installed handler lager_forwarder_backend into rabbit_log_channel_lager_event
  rabbitmq_1   | 2021-03-14 21:21:11.768 [debug] <0.303.0> Lager installed handler lager_forwarder_backend into rabbit_log_feature_flags_lager_event
  rabbitmq_1   | 2021-03-14 21:21:11.769 [debug] <0.309.0> Lager installed handler lager_forwarder_backend into rabbit_log_ldap_lager_event
  rabbitmq_1   | 2021-03-14 21:21:11.772 [debug] <0.312.0> Lager installed handler lager_forwarder_backend into rabbit_log_mirroring_lager_event
  rabbitmq_1   | 2021-03-14 21:21:11.776 [debug] <0.315.0> Lager installed handler lager_forwarder_backend into rabbit_log_prelaunch_lager_event

```


3. por ultimo tendremos el servicio Receiver listo para esperar cualquier mensaje.

```
rabbitmq_1   |  * rabbitmq_prometheus
rabbitmq_1   |  * rabbitmq_management
rabbitmq_1   |  * rabbitmq_web_dispatch
rabbitmq_1   |  * rabbitmq_management_agent
rabbitmq_1   |  completed with 4 plugins.
rabbitmq_1   | 2021-03-14 21:21:20.439 [info] <0.732.0> Resetting node maintenance status
rabbitmq_1   | 2021-03-14 21:21:24.261 [info] <0.1034.0> accepting AMQP connection <0.1034.0> (172.19.0.2:51198 -> 172.19.0.4:5672)
rabbitmq_1   | 2021-03-14 21:21:24.280 [info] <0.1034.0> connection <0.1034.0> (172.19.0.2:51198 -> 172.19.0.4:5672): user 'guest' authenticated and granted access to vhost '/'
receivers_1  | 2021/03/14 21:21:24 [*] Esperado por mensages, para salir es con CTRL+C


```


## Ejemplo de prueba 

1. enviamos un mensaje  de cualquier tipo de cliente en este caso enviaremos desde postman.


![This is a alt text.](/Imagenes/c1.png "This is a sample image.")



2. Lo recibimos en el server 
```
  senders_1    | 2021/03/14 21:25:59  [x] Sent {"age":23,"infectedtype":"communitary","location":"san","name":"jorgais","state":"symptomatic","way":"RabbitMQ"}
  receivers_1  | 2021/03/14 21:25:59 Mensage Recibido: {"age":23,"infectedtype":"communitary","location":"san","name":"jorgais","state":"symptomatic","way":"RabbitMQ"}
  rabbitmq_1   | 2021-03-14 21:25:59.597 [info] <0.1128.0> closing AMQP connection <0.1128.0> (172.19.0.5:47100 -> 172.19.0.4:5672, vhost: '/', user: 'guest')
  rabbitmq_1   | 2021-03-14 21:25:59.597 [info] <0.1142.0> Closing all channels from connection '172.19.0.5:47100 -> 172.19.0.4:5672' because it has been closed
  receivers_1  | 2021/03/14 21:25:59 {"age":23,"infectedtype":"communitary","location":"san","name":"jorgais","state":"symptomatic","way":"RabbitMQ","_id":"604e7f67c77708001af37dff"}
```


3. en este Caso enviamos la informacion a una BD no relacional la cual es MongoDB.

![This is a alt text.](/Imagenes/c2.png "This is a sample image.")



>. "Listo Tendremos  nuestros servicios corriendo al 100%.. "

### UNIVERSIDAD DE SAN CARLOS DE GUATEMALA
### SISTEMAS OPERATIVOS 1
### GUATEMALA, 2021

