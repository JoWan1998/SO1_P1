import React, { Component } from 'react'
import {Pie} from 'react-chartjs-2'
import 'chart.piecelabel.js';

export default class Type extends Component {
    state ={
        respuesta:[],
        estado:[],
        porcentajes:[],
        colores:[],
        data:[],
        opciones:[]
    }
    async peticion(){
        var peticion   = await fetch("http://35.222.55.115:8080/type")  
        var respuestat = await peticion.json();

        this.setState({respuesta: respuestat});

        var estadot=[]
        var porcentajet=[]

        this.state.respuesta.map((elemento)=>{
            estadot.push(elemento.infectedtype);
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
        const data= {
            labels: this.state.estado,
            datasets:[{
                data: this.state.porcentajes,
                backgroundColor: this.state.colores
            }]
        };
        const opciones={
            responsive:true,
            maintainAspectRatio: false,
            pieceLabel:{
                render: function(args) {
                    return args.label+": "+args.value +"%";
                },
                fontSize: 10,
                fontColor: '#ffff',
                fontFamily: 'Arial'
            }
        }
        //almacenamos
        this.setState({data: data, opciones: opciones});
    }
    //ma
    async componentDidMount(){
        await this.peticion();
        await this.generarC_();
        await this.configuracionG_();
    }

    render() {
        return (
            <div className="App" style={{width:'100%',height:'500px'}}>
            <h1>Porcentajes  infectedtype  </h1>
            <Pie data={this.state.data} opciones={this.state.opciones}/>
            </div>
        )
    }


}


