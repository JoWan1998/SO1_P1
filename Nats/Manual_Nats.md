# MANUAL - NATS - PUB/SUB
##### por **José Wannan**

-----------------------------------------------------------
> "La mensajería NATS permite el intercambio de datos segmentados en mensajes entre aplicaciones y servicios informáticos. Estos mensajes se tratan por temas y no dependen de la ubicación de la red. Esto proporciona una capa de abstracción entre la aplicación o el servicio y la red física subyacente. Los datos se codifican y enmarcan como un mensaje y son enviados por un editor. El mensaje es recibido, decodificado y procesado por uno o más abonados." **Nats**.

En el siguiente manual, levantara un servicio de Nats con contenedores de Docker.

-----------------------------------------------------------
## NATS + DOCKER - MICROSERVICIOS
------------------------------------------------------------
## Instalando Docker

En Ubuntu 16.04LTS, ejecuta las siguientes instrucciones:

* Actualiza e instala dependencias

 ```
    $ sudo apt-get update

    $ sudo apt-get upgrade

    $ sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```
* Agrega la clave GPG oficial de Docker.

```
    $ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
 ```

* Agregue el repositorio de Docker

```
    $ echo \
    "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

* Instale Docker Engine

```
    $  sudo apt-get update
    $  sudo apt-get install docker-ce docker-ce-cli containerd.io
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

* nats
    * pubs
    * subs

Cada carpeta sera utilizada para ejecutar su servicio correspondiente.

### Creando Subscriber

Iniciamos creando un modulo de go, para importar nuestras dependencias.

```
    go mod init <module_name>
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

Observaremos nuestro documento de la siguiente manera:

 ```
    module subscribemodule

    go 1.16

    require (
        github.com/golang/protobuf v1.4.3 // indirect
        github.com/nats-io/gnatsd v1.4.1 // indirect
        github.com/nats-io/go-nats v1.7.2
        github.com/nats-io/nkeys v0.2.0 // indirect
        github.com/nats-io/nuid v1.0.1 // indirect
    )
 ```
 Estas son dependencias importantes que ejecutaran nuestro servicio.

 Procedemos a crear nuestro archivo **subscribers.go**, el cual es nuestro servicio.

```
    package main

    //////////////////////////////////////////////////////////
    //// importamos nuestra dependencia

    import (
    "fmt"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/nats-io/go-nats"
    )

    func Persons(w http.ResponseWriter, r *http.Request) {
        fmt.Println(w, "OK")
    }

    //////////////////////////////////////////////////////////
    //// Nuestra funcion principal
    
    func main() {

        //////////////////////////////////////////////////////////
        //// Invocamos una variable de entorno la cual setearemos más adelante.
        uri := os.Getenv("NATS_URI")

        //////////////////////////////////////////////////////////
        //// Inicializamos nuestra variable de error, nos servira como ErrorHandlers
        var err error

        //////////////////////////////////////////////////////////
        //// Inicializamos nats
        var nc *nats.Conn

        //////////////////////////////////////////////////////////
        //// Creamos una serie de iteraciones para esperar conexion por parte del servidor de nats.
        for i := 0; i < 5; i++ {
            nc, err = nats.Connect(uri)
            if err == nil {
                break
            }

            fmt.Println("Waiting before connecting to NATS at:", uri)
            time.Sleep(1 * time.Second)
        }

        //////////////////////////////////////////////////////////
        //// Si existiese un error durante la ejecucion de nuestra conexion indicamos y esperamos conexion.

        if err != nil {
            log.Fatal("Error establishing connection to NATS: %s", uri, err)
        }

        fmt.Println("Connected to NATS at:", nc.ConnectedUrl())

        //////////////////////////////////////////////////////////
        //// Nuestro metodo Subscribe, obtenemos la solicitud y procesamos, podemos incluir peticiones .

        nc.Subscribe("tasks", func(m *nats.Msg) {
            fmt.Println("Got task request on:", m.Subject)
            nc.Publish(m.Reply, []byte("Done!"))

            // .. http request here ...
        })

        fmt.Println("Worker subscribed to 'tasks' for processing requests...")
        fmt.Println("Server listening on port 8181...")

        //////////////////////////////////////////////////////////
        //// indicamos un enlace, localhost:8181/person... para establecer conexiones.

        http.HandleFunc("/person", Persons)

        if err := http.ListenAndServe(":8181", nil); err != nil {
            log.Fatal(err)
        }
    }
```

Para cargar las dependencias de nuestro modulo ejecutamos la siguiente instruccion:

```
    go mod tidy
```

Creamos nuestro **Dockerfile**

Debe de contener las siguientes instrucciones

```
    FROM golang
    WORKDIR /
    COPY . .
    RUN go mod download
    EXPOSE 8080
    CMD ["go","run","subscribers.go"]
```

### Creando Publisher

Iniciamos creando un modulo de go, para importar nuestras dependencias.

```
    go mod init <module_name>
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

Observaremos nuestro documento de la siguiente manera:

 ```
    module subscribemodule

    go 1.16

    require (
        github.com/golang/protobuf v1.4.3 // indirect
        github.com/nats-io/gnatsd v1.4.1 // indirect
        github.com/nats-io/go-nats v1.7.2
        github.com/nats-io/nkeys v0.2.0 // indirect
        github.com/nats-io/nuid v1.0.1 // indirect
    )
 ```
 Estas son dependencias importantes que ejecutaran nuestro servicio.

 Procedemos a crear nuestro archivo **publisher.go**, el cual es nuestro servicio.

```
    package main

    //////////////////////////////////////////////////////////
    //// importamos nuestra dependencia


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
    
    //////////////////////////////////////////////////////////
    //// MANEJO DE ERRORES
    
    func error_(err error, msg string) {
            if err != nil {
                    log.Fatal("%s: $s", msg, err)
            }
    }


    func (s server) Persons(w http.ResponseWriter, r *http.Request) {
        fmt.Println(w, "OK")
    }

    //////////////////////////////////////////////////////////
    //// NUESTRA SOLICITUD HACIA SUBSCRIBER, ES NUESTRO METODO POST, PARA OBTENER DATOS ENVIADOS.

    func (s server) createTask(w http.ResponseWriter, r *http.Request) {
        requestAt := time.Now()
        w.Header().Set("Content-Type", "application/json")
        var body map[string]interface{}
        err := json.NewDecoder(r.Body).Decode(&body)
        error_(err, "parseando Json")
        body["way"] = "Nats"
        data, err := json.Marshal(body)
        error_(err,"ERROR OBTENIENDO CUERPO")
        fmt.Println(string(data))
        
        //////////////////////////////////////////////////////////
        //// EJECUTANDO NUESTRA PUBLISH INSTRUCCION, EN ESTE CASO SOLICITAMOS UN REQUEST PARA QUE PUEDA PROCESAR LA SOLICITUD
        
        response, err := s.nc.Request("tasks", []byte(data), 5*time.Second)
        if err != nil {
        log.Println("Error making NATS request:", err)
        }
        duration := time.Since(requestAt)

        fmt.Fprintf(w, "Task scheduled in %+v\nResponse: %v\n", duration, string(response.Data))
    }

    //////////////////////////////////////////////////////////
    //// NUESTRA FUNCION MAIN PRINCIPAL

    func main() {

        //////////////////////////////////////////////////////////
        //// Inicializamos nuestra instancia de server.
        var s server
       
        //////////////////////////////////////////////////////////
        //// Invocamos una variable de entorno la cual setearemos más adelante.
        uri := os.Getenv("NATS_URI")

        //////////////////////////////////////////////////////////
        //// Inicializamos nuestra variable de error, nos servira como ErrorHandlers
        var err error

        //////////////////////////////////////////////////////////
        //// Esperamos conexion por parte del servidor de nats, el cual estara esperando conectarse de nats://nats:4222

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

        //////////////////////////////////////////////////////////
        //// Iniciamos nuestras rutas de escucha. pertenecen a las solicitudes http://127.0.0.1:8080/person -> to send data

        http.HandleFunc("/", s.createTask)
        http.HandleFunc("/person", s.Persons)
        fmt.Println("Server listening on port 8080...")
        if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatal(err)
        }
    }
```

Para cargar las dependencias de nuestro modulo ejecutamos la siguiente instruccion:

```
    go mod tidy
```

Creamos nuestro **Dockerfile**

Debe de contener las siguientes instrucciones

```
    FROM golang
    WORKDIR /
    COPY . .
    RUN go mod download
    EXPOSE 8080
    CMD ["go","run","publisher.go"]
```

## Creando nuestro build

Luego de crear nuestros servicios pub/sub, nos ubicamos en la carpeta raiz y procedemos a crear nuestro archivo **build.yml**, el cual contendra información necesaria para la ejecución de nuestro servicio.

```
version: '2'

services:
    nats:
        image: nats
        expose:
            - "4222"
        ports:
            - "8222:8222"
        hostname: nats-server
    publisher:
        build: ./pubs
        ports:
            - "8080:8080"
        environment:
            - "NATS_URI=nats://nats:4222"
        depends_on:
            - nats
    subscriber:
        build: ./subs
        restart: on-failure
        environment:
            - "NATS_URI=nats://nats:4222"   
        ports:
            - "8181:8181"                 
        links:
            - nats
        depends_on:
            - nats
```

Luego de crear nuestro archivo, procedemos a construirlo para dicha instruccion ejecutamos los siguientes comandos:

```
    docker-compose -f build.yml build
```

Deben de observar la siguiente salida:


```
    nats uses an image, skipping
    Building publisher
    Step 1/6 : FROM golang
    ---> 3a9c0da54047
    Step 2/6 : WORKDIR /
    ---> Using cache
    ---> 65a075f89765
    Step 3/6 : COPY . .
    ---> 2bd7456fa484
    Step 4/6 : RUN go mod download
    ---> Running in 2129d2f618af
    Removing intermediate container 2129d2f618af
    ---> 8727566c6ae6
    Step 5/6 : EXPOSE 8080
    ---> Running in 282f626e4bd7
    Removing intermediate container 282f626e4bd7
    ---> b97033ecb950
    Step 6/6 : CMD ["go","run","publisher.go"]
    ---> Running in 96e48dd68c74
    Removing intermediate container 96e48dd68c74
    ---> a95495a45d7b
    Successfully built a95495a45d7b
    Successfully tagged natsv1_publisher:latest
    Building subscriber
    Step 1/6 : FROM golang
    ---> 3a9c0da54047
    Step 2/6 : WORKDIR /
    ---> Using cache
    ---> 65a075f89765
    Step 3/6 : COPY . .
    ---> 7dafd81cd745
    Step 4/6 : RUN go mod download
    ---> Running in 43a1f4c97708
    Removing intermediate container 43a1f4c97708
    ---> cf1beef02497
    Step 5/6 : EXPOSE 8080
    ---> Running in f94764453899
    Removing intermediate container f94764453899
    ---> 6d6718b264e1
    Step 6/6 : CMD ["go","run","subscribers.go"]
    ---> Running in 491d0107f159
    Removing intermediate container 491d0107f159
    ---> b807d20a98cc
    Successfully built b807d20a98cc
    Successfully tagged natsv1_subscriber:latest
```

Luego de ejecutar nuestra instruccion, procedemos a levantar nuestro servicio, para ello ejecutamos nuestra instruccion:

```
   docker-compose -f build.yml up 
```

Deben de observar la siguiente salida:

```
    Starting natsv1_nats_1
    Recreating natsv1_publisher_1
    Recreating natsv1_subscriber_1
    Attaching to natsv1_nats_1, natsv1_publisher_1, natsv1_subscriber_1
    nats_1        | [1] 2021/03/10 06:49:22.493037 [INF] Starting nats-server version 2.1.9
    nats_1        | [1] 2021/03/10 06:49:22.493191 [INF] Git commit [7c76626]
    nats_1        | [1] 2021/03/10 06:49:22.494341 [INF] Starting http monitor on 0.0.0.0:8222
    nats_1        | [1] 2021/03/10 06:49:22.495005 [INF] Listening for client connections on 0.0.0.0:4222
    nats_1        | [1] 2021/03/10 06:49:22.495054 [INF] Server id is NDPQXPGHSRID2AMUP4PP66KYAF6NSXEWQEWMJRLHOZO72WT5K
    KXWXFIT
    nats_1        | [1] 2021/03/10 06:49:22.495060 [INF] Server is ready
    nats_1        | [1] 2021/03/10 06:49:22.499212 [INF] Listening for route connections on 0.0.0.0:6222
    subscriber_1  | Connected to NATS at: nats://nats:4222
    subscriber_1  | Worker subscribed to 'tasks' for processing requests...
    subscriber_1  | Server listening on port 8181...
    publisher_1   | Connected to NATS at: nats://nats:4222
    publisher_1   | Server listening on port 8080...
```


Y **Listo**, ya poseemos nuestro servicio **pub/sub Nats**, ejecutandose en nuestro contenedor de Docker.

* Para ejecutar una peticion podemos ejecutar la siguiente instruccion, desde otra consola de comandos:

```
    curl -i -X POST -H "Content-Type: application/json" -d '{"name": "usuario","location": "guatemala","age": "33","infectedtype": "infeccion","state": "guatemala"}' http://35.222.55.115:8080/nuevoRegistro
```

Deben de recibir una salida como esta:

```
    Starting natsv1_nats_1
    Starting natsv1_subscriber_1
    Starting natsv1_publisher_1
    Attaching to natsv1_nats_1, natsv1_publisher_1, natsv1_subscriber_1
    nats_1        | [1] 2021/03/10 06:57:46.881520 [INF] Starting nats-server version 2.1.9
    nats_1        | [1] 2021/03/10 06:57:46.881552 [INF] Git commit [7c76626]
    nats_1        | [1] 2021/03/10 06:57:46.881790 [INF] Starting http monitor on 0.0.0.0:8222
    nats_1        | [1] 2021/03/10 06:57:46.881855 [INF] Listening for client connections on 0.0.0.0:4222
    nats_1        | [1] 2021/03/10 06:57:46.881871 [INF] Server id is NBFSHEHKDCHFKIH2EPLE6BCWOX45PL47WP3GGV4N4MGKAYLOR
    GPPU3N7
    nats_1        | [1] 2021/03/10 06:57:46.881874 [INF] Server is ready
    nats_1        | [1] 2021/03/10 06:57:46.882148 [INF] Listening for route connections on 0.0.0.0:6222
    publisher_1   | Connected to NATS at: nats://nats:4222
    publisher_1   | Server listening on port 8080...
    subscriber_1  | Connected to NATS at: nats://nats:4222
    subscriber_1  | Worker subscribed to 'tasks' for processing requests...
    subscriber_1  | Server listening on port 8181...
    publisher_1   | {"Universidad":"USAC","edad":22,"nombre":"José Wannan","way":"Nats"}
    subscriber_1  | Got task request on: tasks
```

### UNIVERSIDAD DE SAN CARLOS DE GUATEMALA
### SISTEMAS OPERATIVOS 1
### GUATEMALA, 2021