import React, { Component } from 'react'
import {Pie} from 'react-chartjs-2'
import 'chart.piecelabel.js';

export default class Top extends Component {

    state ={
        respuesta:[],
        estado:[],
        porcentajes:[],
        colores:[],
        data:[],
        opciones:[]
    }


    async peticion(){
        var peticion  = await fetch("http://35.222.55.115:8080/state")
        var respuestat = await peticion.json();

        this.setState({respuesta: respuestat});

        var estadot=[]
        var porcentajet=[]

        this.state.respuesta.map((elemento)=>{
            estadot.push(elemento.state);
            porcentajet.push(elemento.porcent);
        });

        this.setState({estado: estadot, porcentajes: porcentajet});
        console.log(this.state.estado)
        console.log(this.state.porcentajes)

        console.log(respuestat)
    }




    //Generar Caracter de manera aleatoria
    generar_(){
        var Caracte= ["a","b","c","d","e","f","1","2","3","4","5","6","7","8","9"]
        var numero = (Math.random()*15).toFixed(0);
        return Caracte[numero];
    }

    //concatena la cadena para que sea un formato de cadena hexadecimal
    colorHex_(){
        var color = "";
        for(var index=0;index<6;index++){
            color= color + this.generar_();
        }
        return "#"+color;
    }

    //generar colores
    generarC_(){
        var coloresf=[];
        for (var i = 0; i < this.state.respuesta.length ; i++){
            coloresf.push(this.colorHex_());
        }
        this.setState({colores:coloresf});
        console.log(this.state.colores);
    }

    //configuramos la grafica
    configuracionG_(){
        const datat= {
            labels: this.state.estado,
            datasets:[{
                data: this.state.porcentajes,
                backgroundColor: this.state.colores
            }]
        };
        const opcionest={
            responsive:true,
            maintainAspectRatio: false,
            pieceLabel: {
                render: 'value' //show values
             }
        }
        //almacenamos
        this.setState({data: datat, opciones: opcionest});
    }

    // metodo que se va a llamar repetidamente para actualizar
    async componentDidMount(){

        await this.peticion();
        await this.generarC_();
        await this.configuracionG_();
    }

    render() {
        return (
            <div className="App" style={{width:'90%',height:'500px'}}>
            <h1>Porcentajes  State </h1>
            <Pie data={this.state.data} opciones={this.state.opciones}/>
            </div>
        )
    }
}
