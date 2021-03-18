package main

import (
	"context"
	"fmt"

	"log"

	"google.golang.org/grpc"
	//"grpccliente/user.pb/user.pb"
)

func registrarUsuario(nameparam string, locationparam string, ageparam int64, infectedtypeparam string, stateparam string) {
	server_host := "0.0.0.0:8080"
	fmt.Println("Enviando peticion ...")

	cc, err := grpc.Dial(server_host, grpc.WithInsecure())

	if err != nil {
		log.Fatalf("Error enviando peticion: %v", err)
	}

	defer cc.Close()

	c := user_pb.NewUserServiceClient(cc)

	fmt.Println("Todo bien en la conexion")

	request := &user_pb.UserRequest{
		User: &user_pb.Usuario{
			Name:         nameparam,
			Location:     locationparam,
			Age:          ageparam,
			Infectedtype: infectedtypeparam,
			State:        stateparam,
		},
	}

	res, err := c.RegUser(context.Background(), request)

	if err != nil {
		log.Fatal("Error en enviar %v", err)
	}

	fmt.Println("Todo good, ", res.Resultado)

}

func main() {
	fmt.Println("Listo!")
	registrarUsuario("nombre", "guate", 21, "infeccion", "guatemala")
}
