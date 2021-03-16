# MANUAL - Google - PUB/SUB
##### por **Abner Hernández**

## ¿Qué es Pub/Sub?
-----------------------------------------------------------
> Es un servicio de mensajería asíncrona que separa los servicios que producen eventos de servicios que procesan eventos.

>Puedes usar Pub/Sub, como middleware orientado a la mensajería o transferencia y entrega de eventos para las canalizaciones de estadísticas de transmisión.

## Conceptos básicos

### Tema
> Un recurso con nombre al que los publicadores envían mensajes.
### Suscripción
> Un recurso con nombre que representa la transmisión de mensajes de un único tema específico que se deben entregar a la aplicación suscripta. Para obtener más detalles sobre la semántica de entrega de mensajes y las suscripciones, consulta la guía para suscriptores
### Mensaje
>La combinación de datos y atributos (opcionales) que un publicador envía a un tema y se entrega por último a los suscriptores
### Atributo de mensaje
>Un par clave-valor que un publicador puede definir para un mensaje. Por ejemplo, la clave iana.org/language_tag y el valor en se podrían agregar a los mensajes para indicar que un suscriptor de habla inglesa puede leerlo

En el siguiente manual, levantara un servicio de Google con contenedores por medio de Docker-Compose.

-----------------------------------------------------------
## Google + DOCKER
------------------------------------------------------------
## Instalando Docker

En Ubuntu 20.04LTS, ejecuta las siguientes instrucciones:

* Actualiza e instala dependencias

 ```
    $ sudo apt-get update

    $ sudo apt-get upgrade
```

* Instale Docker

```
    $  sudo apt-get install docker.io
```

Para que pueda ejecutar Docker sin ningun problema, ejecute las siguientes instrucciones para poder ejecutar Docker sin permisos de root.


* Crea el dockergrupo.

```
    $ sudo groupadd docker
```

* Agregue su usuario al dockergrupo.

```
    $ sudo usermod -aG docker $USER
```


*  para activar los cambios en los grupos:

```
    $ newgrp docker 
```

#### Inicia sesion en Docker Hub

Ejecuta las siguientes instrucciones para iniciar sesion con tus credenciales de Docker.

```
    $ docker login
```
e ingresa tus credenciales.

----------------------------------------------
## Instalando Go

> Go es un lenguaje de programación de código abierto que facilita la creación de software simple , confiable y eficiente. **Go**

* Download Golang

Ingresa a una carpeta temporal, esta nos servira para 

```
    $ cd /tmp
```
Selecciona la arquitectura que desees instalar, puedes hacerlo desde from https://golang.org/dl/, luego de ubicar la version a instalar intercambiala por <VERSION_NUMBER>

```
    $ wget https://golang.org/dl/go1.<VERSION_NUMBER>.linux-amd64.tar.gz
```
* Extraemos el paquete en /usr/local

```
    $ sudo tar -C /usr/local -xzf go1.<VERSION_NUMBER>.linux-amd64.tar.gz
```

* Agreguemos Go a nuestras variables de entorno

```
    $ echo "export PATH=$PATH:/usr/local/go/bin" >> ~/.profile
    $ echo "export GOPATH=~/.go" >> ~/.profile
```

* Recarga las variables de entorno para empezar a usar go.

```
    $ source ~/.profile
```

* Luego de instalar, deberias de poder visualizar la información de tu version al ejecutar el siguiente comando:

```
    $ go version
    # go version go1.<VERSION_NUMBER> linux/amd64
```

------------------------------------------------
## Creando nuestro servicio

Para crear nuestro servicio pub/sub, iniciamos creando un directorio de trabajo por cada uno de los servicios, pub y sub, asi como el directorio raiz, por ejemplo:

* Google_PubSub
    * server
    * client

Cada carpeta sera utilizada para ejecutar su servicio correspondiente.

### Requisitos Previos
1. Contar con una Suscripcion a la plataforma de Google Cloud
2. Crear un Proyecto de no contar con uno.
3. instalar el SDK de Google Cloud 
4. Crea un tema y una suscripción (Esto para poder hacer uso del Publisher y Subscriber)

#### Instalando SDK de Google Cloud 

En Ubuntu 20.04LTS, ejecuta las siguientes instrucciones:

1. Ingresa lo siguiente en un símbolo del sistema:

```
    $ curl https://sdk.cloud.google.com | bash
```
2. Cuando se te solicite, elige una ubicación en el sistema de archivos (por lo general, en el directorio principal) en la que quieras crear el subdirectorio google-cloud-sdk.
3. Si deseas agregar herramientas de línea de comandos del SDK de Cloud a tu PATH y habilitar la finalización de comandos, responde y cuando se te solicite.
4. Reinicia tu shell:

```
    $ exec -l $SHELL
```

5. Ejecuta gcloud init para inicializar el entorno gcloud:

```
    $ gcloud init
```

#### Crea un tema y una suscripción

Una vez que crees un tema, puedes suscribirte o publicarlo.

Usa el comando gcloud pubsub themes create para crear un tema:

```
    $ gcloud pubsub topics create my-topic
```

Usa el comando gcloud pubsub suscripciones create para crear una suscripción. Solo los mensajes publicados en el tema después de crear la suscripción están disponibles para las aplicaciones de suscriptor.

```
    $ gcloud pubsub subscriptions create my-sub --topic my-topic
```

### Creando Subscriber

#### Crear el Modulo de dependencias
Para iniciar un modulo de dependencias en go, ejecutamos el siguiente codigo, agregando el nombre del modulo que deseamos.

```
    $ go mod init <module_name>
```

te generara un archivo **go.mod**, con las siguientes lineas:

```
 ...
    require (
        github.com/golang/protobuf v1.4.3 // indirect
        github.com/nats-io/gnatsd v1.4.1 // indirect
        github.com/nats-io/go-nats v1.7.2
        github.com/nats-io/nkeys v0.2.0 // indirect
        github.com/nats-io/nuid v1.0.1 // indirect
    )
 ...
 ```
 
#### Instalar las bibliotecas cliente

Para instalar las bibliotecas cliente, ejecutamos el siguiente comando:

```
    $ go get -u cloud.google.com/go/pubsub
```
#### Crear nuestro Subscriber
 Procedemos a crear nuestro archivo **async_pull.go**, el cual es nuestro servicio que consumira los mensajes.

```
    package main

    //////////////////////////////////////////////////////////
    //// importamos nuestra dependencia

    import (
      "bytes"
      "context"
      "fmt"
      "io/ioutil"
      "net/http"
      "sync"

      "cloud.google.com/go/pubsub"
      "github.com/tidwall/sjson"
    )
    
    //////////////////////////////////////////////////////////
    //// Funcion pullMsgs con la cual consumiremos los mensajes publicados.
    //// Los atributos que necesitamos para la funcion son el "projectID" que no es mas que el id de nuestro proyecto
    //// "subID" sera el id del subscriber topic que creamos anteriormente
    
    func pullMsgs(projectID, subID string) error {
      //////////////////////////////////////////////////////////
      //// projectID := "my-project-id"
      //// subID := "my-sub"
      
      ctx := context.Background()
      
      //////////////////////////////////////////////////////////
      //// creamos un objeto de tipo cliente
      
      client, err := pubsub.NewClient(ctx, projectID)
      
      //////////////////////////////////////////////////////////
      //// Condicion para retornar en caso de un error al crear el cliente
      
      if err != nil {
        fmt.Print(err)
        return fmt.Errorf("pubsub.NewClient: %v", err)
      }

      var mu sync.Mutex

      //////////////////////////////////////////////////////////
      //// Creamos un objeto de tipo Subscripcion para poder consumir los mensajes.
      
      sub := client.Subscription(subID)
      //cctx, cancel := context.WithCancel(ctx) //Se usaria en el caso que queramos cerrar el canal
      
      //////////////////////////////////////////////////////////
      //// Consumimos los mensajes, luego enviamos respuesta.
      
      err = sub.Receive(ctx, func(ctx context.Context, msg *pubsub.Message) {
        mu.Lock()
        defer mu.Unlock()
        fmt.Println("Got message: " + string(msg.Data))
        msg.Ack()

        //Codigo para Hacer la peticion Post fuera del container
        value := string(msg.Data)
        mesage, _ := sjson.Set(value, "Server_2", "Modificacion")
        b := []byte(mesage)
        resp, err := http.Post("URL", "application/json",
          bytes.NewBuffer(b))

        if err != nil {
          fmt.Print(err)
        }

        body, err := ioutil.ReadAll(resp.Body)
        fmt.Println(string(body))

      })
      
      //////////////////////////////////////////////////////////
      //// Condicion para retornar en caso no obtener el mensaje correctamente
      
      if err != nil {
        fmt.Print(err)
        return fmt.Errorf("Receive: %v", err)
      }
      return nil
    }

    //////////////////////////////////////////////////////////
    //// NUESTRA FUNCION MAIN PRINCIPAL
    
    func main() {
      pullMsgs("civic-polymer-305516", "proyect_topic-sub")
    }
```

Para cargar las dependencias de nuestro modulo ejecutamos la siguiente instruccion:

```
    $ go mod tidy
```

Creamos nuestro **Dockerfile**

Debe de contener las siguientes instrucciones

```
FROM golang
WORKDIR /Server2
COPY . /Server2
RUN go get -u cloud.google.com/go/pubsub
RUN go get -u github.com/tidwall/sjson
RUN export GOOGLE_APPLICATION_CREDENTIALS='clave.json'
CMD [ "go", "run", "async_pull.go"]
```

como podemos ver necesitamos indicamos el nombre de la clave que descargamos previamente

### Creando Publisher

#### Crear el Modulo de dependencias
Iniciamos creando un modulo de go, para importar nuestras dependencias.

```
    $ go mod init <module_name>
```

te generara un archivo **go.mod**, el cual editaremos adjuntado las siguientes lineas:

```
 ...
    require (
        github.com/golang/protobuf v1.4.3 // indirect
        github.com/nats-io/gnatsd v1.4.1 // indirect
        github.com/nats-io/go-nats v1.7.2
        github.com/nats-io/nkeys v0.2.0 // indirect
        github.com/nats-io/nuid v1.0.1 // indirect
    )
 ...
 ```


 Procedemos a crear nuestro archivo **publish_scale.go**, el cual es nuestro servicio.

```
    package main
    
    //////////////////////////////////////////////////////////
    //// importamos nuestra dependencia
    
    import (
      "bytes"
      "context"
      "fmt"
      "io"
      "io/ioutil"
      "net/http"
      "sync"
      "sync/atomic"

      "cloud.google.com/go/pubsub"
      "github.com/tidwall/sjson"
    )
    //////////////////////////////////////////////////////////
    //// Funcion publishThatScales con la cual publicaremos nuestros mensajes.
    //// Los atributos que necesitamos para la funcion son el "projectID" que no es mas que el id de nuestro proyecto
    //// "subID" sera el id del subscriber topic que creamos anteriormente
    
    func publishThatScales(w io.Writer, projectID, topicID string, mensaje string) error {
      //////////////////////////////////////////////////////////
      //// projectID := "my-project-id"
      //// topicID  := "my-topic"

      ctx := context.Background()
      
      //////////////////////////////////////////////////////////
      //// creamos un objeto de tipo cliente
      
      client, err := pubsub.NewClient(ctx, projectID)
      
      //////////////////////////////////////////////////////////
      //// Condicion para retornar en caso de un error al crear el cliente
      
      if err != nil {
        return fmt.Errorf("pubsub.NewClient: %v", err)
      }
      
      var wg sync.WaitGroup
      var totalErrors uint64
      
      //////////////////////////////////////////////////////////
      //// Creamos un objeto cliente con el "topicID" que definimos anteriormente.
      t := client.Topic(topicID)

      result := t.Publish(ctx, &pubsub.Message{
        Data: []byte(mensaje),
      })

      wg.Add(1)
      go func(res *pubsub.PublishResult) {
        defer wg.Done()
        // The Get method blocks until a server-generated ID or
        // an error is returned for the published message.
        id, err := res.Get(ctx)
        if err != nil {
          // Error handling code can be added here.
          fmt.Fprintf(w, "Failed to publish: %v", err)
          atomic.AddUint64(&totalErrors, 1)
          return
        }
        fmt.Println("Published message!", id)
      }(result)

      wg.Wait()

      if totalErrors > 0 {
        return fmt.Errorf("%d message did not publish successfully", totalErrors)
      }
      return nil
    }
    
    //////////////////////////////////////////////////////////
    //// Funcion manejador es para escuchar una peticion para realizar la publicacion de estos.
    
    func manejador(w http.ResponseWriter, r *http.Request) {
      body, err := ioutil.ReadAll(r.Body)
      if err != nil {
        panic(err)
      }
      fmt.Println("response Body:", string(body))

      value := string(body)
      mesage, _ := sjson.Set(value, "Server_1", "Modificacion")

      buf := new(bytes.Buffer)
      var errorPublisher = publishThatScales(buf, "civic-polymer-305516", "proyect_topic", mesage)
      fmt.Print(buf.String())
      if err != nil {
        fmt.Print(errorPublisher)
        panic(err)

      }
    }
    
    //////////////////////////////////////////////////////////
    //// NUESTRA FUNCION MAIN PRINCIPAL
    func main() {
      http.HandleFunc("/", manejador)
      fmt.Println("El servidor se encuentra en ejecución")
      fmt.Println(http.ListenAndServe(":8080", nil))
    }
```

Para cargar las dependencias de nuestro modulo ejecutamos la siguiente instruccion:

```
    $ go mod tidy
```

Creamos nuestro **Dockerfile**

Debe de contener las siguientes instrucciones

```
FROM golang
WORKDIR /Server1
COPY . /Server1
RUN go get -u cloud.google.com/go/pubsub
RUN go get -u github.com/tidwall/sjson
EXPOSE 8080
RUN export GOOGLE_APPLICATION_CREDENTIALS='clave.json'
CMD [ "go", "run", "publish_scale.go"]
```

## Descargar Docker Compose e instalarlo

Ejecute este comando para descargar la versión estable actual de Docker Compose: 

```
    $ sudo curl -L "https://github.com/docker/compose/releases/download/1.28.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

Ahora se le agregan los permisos necesarios para ejecutarlo:
```
    $ sudo chmod +x /usr/local/bin/docker-compose
```

### Crear el archivo docker-compose.yml para agrupar microservicios

```
version: '3.9'

networks:
  GooglePubSub:
    name: GooglePubSub
    driver: bridge

services:
  publisher:
    build:
      context: ./server
    image: s1_publisher
    ports:
      - "80:8080"
    networks:
      - GooglePubSub
  subscriber:
    build:
      context: ./client
    image: "s2_subscriber"
    networks:
      - GooglePubSub
```

Dentro de la carpeta que contiene le archivo docker-compose.yml ejecutamos:

```
    $ docker-compose up -d
```

Luego de ejecutar el comando anterior se crearan los containers Pub/Sub y se ejecutaran.

### UNIVERSIDAD DE SAN CARLOS DE GUATEMALA
### SISTEMAS OPERATIVOS 1
### GUATEMALA, 2021
