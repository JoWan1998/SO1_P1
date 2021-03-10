package main
import (
        "encoding/json"
        "log"
        "net/http"
        "fmt"
        "os"
        "flag"
        "github.com/nats-io/go-nats"
)
//MANEJO DE ERRORES
func error_(err error, msg string) {
        if err != nil {
                log.Fatal("%s: $s", msg, err)
        }
}
func usage() {
        log.Printf("Usage: nats-pub [-s server] [-creds file] <subject> <msg>\n")
        flag.PrintDefaults()
}
func showUsageAndExit(exitcode int) {
        usage()
        os.Exit(exitcode)
}

func Persons(w http.ResponseWriter, r *http.Request) {
	fmt.Println(w, "OK")
}

//CREACION DE SOLICITUDES
func task_(w http.ResponseWriter, r *http.Request) {
        //INGRESAR PETICION
        w.Header().Set("Content-Type", "application/json")
        //BODY
        var body map[string]interface{}
        var err = json.NewDecoder(r.Body).Decode(&body)
        error_(err, "JSON error parse")
        body["way"] = "Nats"
        data, err := json.Marshal(body)
        //SERVER CONNECTION
        var urls = flag.String("s", nats.DefaultURL, "The nats server URLs (separated by comma)")
        var userCreds = flag.String("creds", "", "User Credentials File")
        var showHelp = flag.Bool("h", false, "Show help message")
        var reply = flag.String("reply", "", "Sets a specific reply subject")
        log.SetFlags(0)
        flag.Usage = usage
        flag.Parse()
        if *showHelp {
                showUsageAndExit(0)
        }
		args := flag.Args()
        if len(args) != 2 {
                showUsageAndExit(1)
        }
        // Connect Options.
        opts := []nats.Option{nats.Name("NATS Publisher")}
        // Use UserCredentials
        if *userCreds != "" {
                opts = append(opts, nats.UserCredentials(*userCreds))
        }
        // Connect to NATS
        nc, err := nats.Connect(*urls, opts...)
        if err != nil {
                log.Fatal(err)
        }
        error_(err, "ERROR CONNECTION WITH NATS")
		defer nc.Close()
        datos := string(data)
        user := "user_nats"
        subj, msg := user, []byte(datos)
        if reply != nil && *reply != "" {
                nc.PublishRequest(subj, *reply, msg)
        } else {
                nc.Publish(subj,msg)
        }
        nc.Flush()
        if err := nc.LastError(); err != nil {
                log.Fatal(err)
        } else {
                log.Printf("Published [%s] : '%s'\n", subj, msg)
        }
}


//MANEJADOR DE PETICIONES
func http_peticion_() {
	http.HandleFunc("/", task_)
	http.HandleFunc("/person", Persons)
	fmt.Println("Server listening on port 8080...")
	log.Fatal(http.ListenAndServe(":3000",nil))
}
func main() {
	http_peticion_()
}
