package main

// [START pubsub_subscriber_async_pull]
// [START pubsub_quickstart_subscriber]

import (
	"bytes"
	"context"
	"fmt"
	"io/ioutil"
	"net/http" //Libreria necesaria para trabajar Api y realizar peticion post, descomentar
	"sync"

	"cloud.google.com/go/pubsub"
	"github.com/tidwall/sjson"
)

type Block struct {
    Try     func()
    Catch   func(Exception)
    Finally func()
}
 
type Exception interface{}
 
func Throw(up Exception) {
    panic(up)
}
 
func (tcf Block) Do() {
    if tcf.Finally != nil {
 
        defer tcf.Finally()
    }
    if tcf.Catch != nil {
        defer func() {
            if r := recover(); r != nil {
                tcf.Catch(r)
            }
        }()
    }
    tcf.Try()
}

func pullMsgs(projectID, subID string) error {
	// projectID := "my-project-id"
	// subID := "my-sub"
	ctx := context.Background()
	client, err := pubsub.NewClient(ctx, projectID)
	if err != nil {
		fmt.Print(err)
		return fmt.Errorf("pubsub.NewClient: %v", err)
	}
	// Consume 10 messages.
	var mu sync.Mutex
	//received := 0
	sub := client.Subscription(subID)
	//cctx, cancel := context.WithCancel(ctx) //Se usaria en el caso que queramos cerrar el canal
	err = sub.Receive(ctx, func(ctx context.Context, msg *pubsub.Message) {
		mu.Lock()
		defer mu.Unlock()
		fmt.Println("Got message: " + string(msg.Data))
		msg.Ack()

		value := string(msg.Data)
		mesage, _ := sjson.Set(value, "way", "Google")
		b := []byte(mesage)
		resp, err := http.Post("http://35.222.55.115:8080/nuevoRegistro", "application/json",
			bytes.NewBuffer(b))

		if err != nil {
			fmt.Print(err)
		}

		body, err := ioutil.ReadAll(resp.Body)
		fmt.Println(string(body))

	})

	if err != nil {
		fmt.Print(err)
		return fmt.Errorf("Receive: %v", err)
	}
	return nil
}

func main() {

	for true {
		Block{
			Try: func() {
				pullMsgs("mensajeria-308315", "tema_proyecto-sub")
			},
			Catch: func(e Exception) {
				fmt.Printf("Caught %v\n", e)
			},
		}.Do()
    }
}