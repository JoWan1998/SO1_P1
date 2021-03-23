package main

// [START pubsub_publish_with_error_handler]
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

func publishThatScales(w io.Writer, projectID, topicID string, mensaje string) error {
	// projectID := "my-project-id"
	// topicID := "my-topic"
	ctx := context.Background()
	client, err := pubsub.NewClient(ctx, projectID)
	if err != nil {
		return fmt.Errorf("pubsub.NewClient: %v", err)
	}
	var wg sync.WaitGroup
	var totalErrors uint64
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

func manejador(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		panic(err)
	}
	fmt.Println("response Body:", string(body))

	value := string(body)
	mesage, _ := sjson.Set(value, "way", "Google")

	buf := new(bytes.Buffer)
	var errorPublisher = publishThatScales(buf, "mensajeria-308315", "tema_proyecto", mesage)
	fmt.Print(buf.String())
	if err != nil {
		fmt.Print(errorPublisher)
		panic(err)

	}
}

func main() {
	http.HandleFunc("/", manejador)
	fmt.Println("El servidor se encuentra en ejecución")
	fmt.Println(http.ListenAndServe(":8080", nil))
}