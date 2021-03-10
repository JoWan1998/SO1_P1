package main

import (
        "log"
        "os"
        "time"
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
func sendMsg(m *nats.Msg, i int) {
        log.Printf("[#%d] Received on [%s]: '%s'", i, m.Subject, string(m.Data))
}
//CONEXION CON SERVIDOR
func main() {
        //CONECTANDO CON EL SERVER
        var urls = flag.String("s", nats.DefaultURL, "The nats server URLs (separated by comma)")
        var userCreds = flag.String("creds", "", "User Credentials File")
        var showTime = flag.Bool("t", false, "Display timestamps")
		var showHelp = flag.Bool("h", false, "Show help message")
        log.SetFlags(0)
        flag.Usage = usage
        flag.Parse()
        if *showHelp {
                showUsageAndExit(0)
        }
        args := flag.Args()
        if len(args) != 1 {
                showUsageAndExit(1)
        }
        // Connect Options.
        opts := []nats.Option{nats.Name("NATS Sample Subscriber")}
        opts = setupConnOptions(opts)

        // Use UserCredentials
        if *userCreds != "" {
			opts = append(opts, nats.UserCredentials(*userCreds))
		}

		// Connect to NATS
		nc, err := nats.Connect(*urls, opts...)
        if err != nil {
				log.Fatal(err)
		}
		error_(err, "ERROR CONECTANDO SERVER")
		user := "user_nats"
		subj, i := user, 0
		forever := make(chan bool)
		nc.Subscribe(subj, func(msg *nats.Msg) {
				i += 1
				sendMsg(msg, i)
		})
		nc.Flush()
		error_(err,"ERROR LEYENDO MENSAJES")
		if err := nc.LastError(); err != nil {
				log.Fatal(err)
		}

		log.Printf("Listening on [%s]", subj)
        if *showTime {
                log.SetFlags(log.LstdFlags)
        }

        runtime.Goexit()

}

func setupConnOptions(opts []nats.Option) []nats.Option {
	totalWait := 10 * time.Minute
	
	reconnectDelay := time.Second
	opts = append(opts, nats.ReconnectWait(reconnectDelay))
	opts = append(opts, nats.MaxReconnects(int(totalWait/reconnectDelay)))
	//opts = append(opts, nats.DisconnectErrHandler(func(nc *nats.Conn, err error) {
	//		log.Printf("Disconnected due to:%s, will attempt reconnects for %.0fm", err, tota$
	//}))
	opts = append(opts, nats.ReconnectHandler(func(nc *nats.Conn) {
			log.Printf("Reconnected [%s]", nc.ConnectedUrl())
	}))
	opts = append(opts, nats.ClosedHandler(func(nc *nats.Conn) {
			log.Fatalf("Exiting: %v", nc.LastError())
	}))
	return opts
}
