import React, { Component } from 'react'
import Table from './Table';


export default class Funell extends Component {
    constructor(props) {
        super(props);
        this.peticion = this.peticion.bind(this);

        this.child1 = React.createRef();
        this.headerstable = ["name", "location", "age", "infectedtype", "state", "way"]
        this.genres = [
            { id: 1, genre: "All" },
            { id: 2, genre: "gRPC" },
            { id: 3, genre: "NATS" },
            { id: 4, genre: "Google" },
            { id: 5, genre: "RabbitMQ" }
        ]
        this.state = {
            filtrado:[]
        }
      }

    async peticion(){
        await fetch("http://35.222.55.115:8080/obtenerUsuarios").then((r)=>
        {
            r.json().then((result)=>
            {
                this.state.filtrado = JSON.parse(JSON.stringify(result));
            })
        })

    }
    //ma
    async componentDidMount(){
        setInterval(this.peticion, 3000);
    }
    //

    handleGenreSelect = genre => {
        try
        {

            this.child1.current.removeRow();
            //console.log(this.state.filtrado);
            switch(genre.target.selectedIndex)
            {
                case 0:
                    let aux = [];
                    this.state.filtrado.reverse().map((datar) => {
                        aux.push({
                        "name": datar.name,
                        "location": datar.location,
                        "age": datar.age,
                        "infectedtype": datar.infectedtype,
                        "state": datar.state,
                        "way": datar.way
                        })
                    })
                    this.child1.current.agregar_datos(aux);
                    break;
                case 1:
                    let aux1 = [];
                    this.state.filtrado.reverse().map((datar) => {
                        if(datar.way.toLowerCase() == "grpc")
                            aux1.push({
                                "name": datar.name,
                                "location": datar.location,
                                "age": datar.age,
                                "infectedtype": datar.infectedtype,
                                "state": datar.state,
                                "way": datar.way
                            })
                    })
                    this.child1.current.agregar_datos(aux1);
                    break;
                case 2:
                    let aux2 = [];
                    this.state.filtrado.reverse().map((datar) => {
                        if(datar.way.toLowerCase() == "nats")
                            aux2.push({
                                "name": datar.name,
                                "location": datar.location,
                                "age": datar.age,
                                "infectedtype": datar.infectedtype,
                                "state": datar.state,
                                "way": datar.way
                            })
                    })
                    this.child1.current.agregar_datos(aux2);
                    break;
                case 3:
                    let aux3 = [];
                    this.state.filtrado.reverse().map((datar) => {
                        if(datar.way.toLowerCase() == "google")
                            aux3.push({
                                "name": datar.name,
                                "location": datar.location,
                                "age": datar.age,
                                "infectedtype": datar.infectedtype,
                                "state": datar.state,
                                "way": datar.way
                            })
                    })
                    this.child1.current.agregar_datos(aux3);
                    break;
                case 4:
                    let aux4 = [];
                    this.state.filtrado.reverse().map((datar) => {
                        if(datar.way.toLowerCase() == "rabbitmq")
                            aux4.push({
                                "name": datar.name,
                                "location": datar.location,
                                "age": datar.age,
                                "infectedtype": datar.infectedtype,
                                "state": datar.state,
                                "way": datar.way
                            })
                    })
                    this.child1.current.agregar_datos(aux4);
                    break;
            }
        }catch
        {
            console.log("Conflicto")
        }
    }

    render() {
        return (

            <div className="App" style={{width:'100%',height:'500px'}}>

                <h1>Mensajeria</h1>

                <select className="custom-select" onChange={this.handleGenreSelect}>
                    {this.genres.map(el => <option key={el.id}>{el.genre}</option>)}
                </select>

                <div className="card border-primary mb-3">
                  <div className="card-body">
                      <div className="table-responsive">
                          <Table data={this.headerstable} ref={this.child1}/>
                      </div>
                  </div>
                </div>
            </div>
        )
    }
}

