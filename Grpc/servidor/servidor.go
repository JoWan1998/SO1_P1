package main

import (
	"context"
	"fmt"
	"log"
	"net"
	//"os"

	"google.golang.org/grpc"
	"grpcserver/user.pb/user.pb"
)

type servidor struct{}

func (*servidor) RegUser(ctx context.Context, req *user_pb.UserRequest) (*user_pb.UserResponse, error) {
	fmt.Println("Todo bien!")

	


	result := &user_pb.UserResponse{
		Resultado: "Respuestita de GRPC",
	}

	return result, nil
}

func main() {
	//host := os.Getenv("HOST")
	host := "0.0.0.0:8081"
	fmt.Println("Servidor iniciado en ", host)

	lis, err := net.Listen("tcp", host)
	if err != nil {
		log.Fatalf("F con el servidor: %v", err)
	}

	fmt.Println("Empezando servidor grpc ...")

	s := grpc.NewServer()

	user_pb.RegisterUserServiceServer(s, &servidor{})

	fmt.Println("Servidor a la espera ...")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("El servidor no funciona: %v", err)
	}
}
