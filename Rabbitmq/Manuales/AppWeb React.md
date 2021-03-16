
# MANUAL - Aplicacion Web 


# Instalacion de Modulos como tambien creacion de la app


1. Creamos toda la estructura de la app 

```
 npx créate-react-app  "Nombre de la app"
```

2. 




* Tenemos los siguientes componentes , determinados para funciones en especifico.

![This is a alt text.](/Rabbitmq/Manuales/Imagenes/comp1.png "This is a sample image.")


* tenemos la siguiente estructura.

![This is a alt text.](/Rabbitmq/Manuales/Imagenes/comp2.png "This is a sample image.")


* estando en la carpeta raiz podemos inicar el proceso con 


```
  npm start

```


* Pero nosotros utilizaremos docker compose para dockerizar nuestra appweb

A continuacion se explicara dicho modulo.




# Docker compose 

1. Creacion del archivo docker-compose quien nos encerrara el ambiente para correr nuestra appweb.

```
version: '3.5'                   //utilizamos la  sintaxis 3.5 


services:                        //contenedor que  tendremos para el servicio 
    app:
        image: node:12-alpine    // imagen que necesitamos para correr  la app web
        volumes: 
          - ./:/app:cached       // aqui es donde tendremos la info de la app y catched la utilizamos para que recargue cada sierto tiempo 
                                 // no hasta nueva compilacion 
        working_dir: /app        //directorio de trabajo 
        ports: 
          - 3000:3000            //puerto en el que se mapea el contenedor 
        command: npm start       // comando que utilizaremos 
        tty: true                //  esto es para que se levante el servicio y nos indique 

```



# Diseño UX/UI

1. Sabiendo que la mayoría de personas toma el celular por la mano derecha se colocó un menú  que se extiende si el tamaño de la pantalla tiene ciertas dimensiones , y si es grande se extiende.

![This is a alt text.](/Rabbitmq/Manuales/Imagenes/u1.png "This is a sample image.")

2. Tenemos cuando se extiende.

![This is a alt text.](/Rabbitmq/Manuales/Imagenes/u2.png "This is a sample image.")


3. cuando se contrae a sierto tamaño.


![This is a alt text.](/Rabbitmq/Manuales/Imagenes/u3.png "This is a sample image.")