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
		//received++
		/*if received == 10 { // Se indicaria el numero de mensajes que queremos obtener de forma asincrona y luego cerrar el canal
			cancel()
		}*/

		//Codigo para Hacer la peticion Post fuera del container
		value := string(msg.Data)
		mesage, _ := sjson.Set(value, "way", "Google_Subscriber")
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
	pullMsgs("civic-polymer-305516", "my-sub")
}
