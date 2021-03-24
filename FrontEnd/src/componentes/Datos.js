import React, {Component} from 'react'
import Table from "./Table1";
import {Bar, Pie} from 'react-chartjs-2'
import 'chart.piecelabel.js';
import CanvasJSReact from '../canvasjs.react';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

var dataPoint;
var total;
var datap = [
    { y: 1400, label: "Prospects" },
    { y: 1212, label: "Qualified Prospects" },
    { y: 1080, label: "Proposals" },
    { y: 665,  label: "Negotiation" },
    { y: 578, label: "Final Sales" }
];
const options = {
    animationEnabled: true,
    title:{
        text: "Top 5 departamentos infectados"
    },
    data: [{
        type: "funnel",
        toolTipContent: "<b>{label}</b>: {y} <b>({percentage}%)</b>",
        indexLabelPlacement: "inside",
        indexLabel: "{label} ({percentage}%)",
        dataPoints: datap
    }]
}


export default class Datos extends Component {

    constructor(props) {
        super(props);
        this.childPacientes1 =  React.createRef();
        this.table_Headers = ["Paciente","Edad","Ubicacion","Tipo","Estado"];
        this.updatePacientes= this.updatePacientes.bind(this);
        this.peticionIT= this.peticionIT.bind(this);
        this.peticionCE= this.peticionCE.bind(this);
        this.peticiones_Range = this.peticiones_Range.bind(this);
        this.updateRegion = this.updateRegion.bind(this);
        this.configuracion_Funnel = this.configuracion_Funnel.bind(this);

        this.state5 = {
            Region: '',
            cantidad: 0
        }

        this.state = {
            curTime : null
        }

        this.state4 = {
            filtrado:[],
            opciones:[],
            points:[]
        }
        this.state1 ={
            respuesta:[],
            infectedtype:[],
            porcentajes:[],
            colores:[],
            data:[],
            opciones:[]
        }
        this.state2 ={
            respuesta:[],
            estado:[],
            porcentajes:[],
            colores:[],
            data:[],
            opciones: []
        }
        this.state3 ={
            respuesta: [],
            edad: [],
            cantidad: [],
            colores: [],
            data: [],
            opciones: [],
            type: 'bar'
        }
    }

    async peticionIT(){
        //hacemos la peticion
        await fetch("http://35.222.55.115:8080/type").then(res=>
        {
            res.json().then((result) => {
                this.state1.respuesta = JSON.parse(JSON.stringify(result))
                if (this.state1.respuesta.length > 1) {
                    var estadot = []
                    var porcentajet = []

                    this.state1.respuesta.forEach((elemento) => {
                        estadot.push(elemento.infectedtype);
                        porcentajet.push(elemento.porcent);
                    });

                    this.state1.infectedtype = estadot;
                    this.state1.porcentajes = porcentajet;
                    this.generarC_IT();
                    this.configuracionG_IT();
                }
            })
        }).catch(err => alert(err))
    }

    //Generar Caracter de manera aleatoria
    generar_IT(){
        var Caracte= ["a","b","c","d","e","f","1","2","3","4","5","6","7","8","9"]
        var numero = (Math.random()*15).toFixed(0);
        return Caracte[numero];
    }

    //concatena la cadena para que sea un formato de cadena hexadecimal
    colorHex_IT(){
        var color = "";
        for(var index=0;index<6;index++){
            color= color + this.generar_IT();
        }
        return "#"+color;
    }

    //generar colores
    generarC_IT(){
        var coloresf=[];
        for (var i = 0; i < this.state1.respuesta.length ; i++){
            coloresf.push(this.colorHex_IT());
        }
        this.state1.colores = coloresf;
        //this.setState({colores:coloresf});
        //console.log(this.state1.colores);
    }

    //configuramos la grafica
    configuracionG_IT(){
        const data= {
            labels: this.state1.infectedtype,
            datasets:[{
                data: this.state1.porcentajes,
                backgroundColor: this.state1.colores
            }]
        };

        const opciones={
            responsive:true,
            maintainAspectRatio: false,
            outlabels: {
                text: 'value'
            }
        }
        //almacenamos
        this.state1.data = data;
        this.state1.opciones= opciones;
        //this.setState({data: data, opciones: opciones});
    }

    async peticionCE(){
        await fetch("http://35.222.55.115:8080/state").then(res=>
        {
            res.json().then((result) => {
                this.state2.respuesta = JSON.parse(JSON.stringify(result))
                if (this.state2.respuesta.length > 1) {
                    var estadot = []
                    var porcentajet = []

                    this.state2.respuesta.forEach((elemento) => {
                        estadot.push(elemento.state);
                        porcentajet.push(elemento.porcent);
                    });

                    this.state2.estado = estadot;
                    this.state2.porcentajes = porcentajet;

                    this.generarC_CE();
                    this.configuracionG_CE();
                }
            })
        }).catch(err => alert(err))

    }

    //Generar Caracter de manera aleatoria
    generar_CE(){
        var Caracte= ["a","b","c","d","e","f","1","2","3","4","5","6","7","8","9"]
        var numero = (Math.random()*15).toFixed(0);
        return Caracte[numero];
    }

    //concatena la cadena para que sea un formato de cadena hexadecimal
    colorHex_CE(){
        var color = "";
        for(var index=0;index<6;index++){
            color= color + this.generar_CE();
        }
        return "#"+color;
    }

    //generar colores
    generarC_CE(){
        var coloresf=[];
        for (var i = 0; i < this.state2.respuesta.length ; i++){
            coloresf.push(this.colorHex_CE());
        }
        this.state2.colores = coloresf;
    }

    //configuramos la grafica
    configuracionG_CE(){
        const datat= {
            labels: this.state2.estado,
            datasets:[{
                data: this.state2.porcentajes,
                backgroundColor: this.state2.colores
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
        this.state2.data = datat;
        this.state2.opciones = opcionest;
    }

    generar_RE(){
        var Caracte= ["a","b","c","d","e","f","1","2","3","4","5","6","7","8","9"]
        var numero = (Math.random()*15).toFixed(0);
        return Caracte[numero];
    }

    //concatena la cadena para que sea un formato de cadena hexadecimal
    colorHex_RE(){
        var color = "";
        for(var index=0;index<6;index++){
            color= color + this.generar_RE();
        }
        return "#"+color;
    }

    //generar colores
    generarC_RE(){
        var coloresf=[];
        for (var i = 0; i < this.state3.respuesta.length ; i++){
            coloresf.push(this.colorHex_RE());
        }
        this.state3.colores = coloresf;
    }
    



    async peticiones_Range()
    {
        await fetch('http://35.222.55.115:8080/Ages').then(res=>{
            res.json().then(result=>
            {
                let values = JSON.parse(JSON.stringify(result));
                this.generarC_RE();
                if(values.length > 0) this.state3.respuesta = values;
                this.state3.edad = []
                this.state3.cantidad = []
                this.state3.respuesta.forEach(item=>
                {
                    this.state3.cantidad.push(item.count)
                    this.state3.edad.push(item.legend)
                });
                var densityData = {
                    label: 'Edad de Pacientes',
                    data: this.state3.cantidad,
                    backgroundColor: this.state3.colores,
                    borderColor: this.state3.colores,
                    borderWidth: 2,
                    hoverBorderWidth: 0
                };
                this.state3.data = {
                    labels: this.state3.edad,
                    datasets: [densityData]
                };

                this.state3.opciones = {
                    elements: {
                        rectangle: {
                            borderSkipped: 'left',
                        }
                    }
                };

            })
        }).catch(err => alert(err))
    }





    async configuracion_Funnel(){
        //hacemos la peticion
        await fetch("http://35.222.55.115:8080/Top5").then(r=>
        {
            r.json().then(
                result =>
                {
                    this.state4.points = JSON.parse(JSON.stringify(result));

                    if(this.state4.points.length > 1)
                    {
                        let initial =  datap.length
                        for(let i = 0; i <= initial ; i++)
                            datap.pop();

                        for(let i = 0 ; i < 5; i++)
                            datap.push({ y: this.state4.points[i].valor, label: "Ubicacion: "+this.state4.points[i].location +", Cantidad: "+this.state4.points[i].valor });

                        dataPoint = options.data[0].dataPoints;
                        total = dataPoint[0].y;
                        options.data[0].dataPoints[0].percentage = 100;
                        for(var i = 1; i < datap.length; i++) {
                            options.data[0].dataPoints[i].percentage = ((dataPoint[i].y / total) * 100).toFixed(2);
                        }
                        if(this.chart5 != undefined)
                            this.chart5.render();
                    }
                }
            )
        }).catch(err => alert(err))
    }


    async componentDidMount() {
        try {
            setInterval( () => {
                this.setState({
                    curTime : new Date().toLocaleString()
                })
            },2000)
            setInterval(this.updatePacientes,2000);
            setInterval(this.peticionIT, 2000);
            setInterval(this.peticionCE, 2000);
            setInterval(this.peticiones_Range, 2000);
            setInterval(this.configuracion_Funnel, 2000);
            setInterval(this.updateRegion, 2000);
        } catch (error) {
            console.log("Errores de render");
        }
    }


    componentWillUnmount() {
        clearInterval(this.updatePacientes);
        clearInterval(this.peticionIT);
        clearInterval(this.peticionCE);
        clearInterval(this.peticiones_Range);
        clearInterval(this.configuracion_Funnel);
        clearInterval(this.updateRegion);
    }

    async updatePacientes() {
        await fetch('http://35.222.55.115:8080/top5/pacientes').then((res) => {
            res.json().then((result) => {
                let stringify = JSON.parse(JSON.stringify(result))
                if(stringify.length>1 && this.childPacientes1.current != null)
                {
                    this.childPacientes1.current.agregar_datos(stringify);
                }

            })
        }).catch(err => alert(err))
    }

    async updateRegion() {
        await fetch('http://35.222.55.115:8080/region').then((res) => {
            res.json().then((result) => {
                if(result.length > 0)
                {
                    let stringify = JSON.parse(JSON.stringify(result))
                    this.state5.Region = stringify[0].region;
                    this.state5.cantidad = stringify[0].total;
                }
            })
        }).catch(err => alert(err))
    }


    render() {
        return(

            <div className="container-fluid">
                <br/>
                <div className="row">
                    <div className="col col-lg-4 col-md-12 col-sm-12">
                        <div className="card border-primary mb-3" id="Integrantes">
                            <div className="card-header">
                                <h1>Integrantes</h1>
                            </div>
                            <div className="card-body">
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item">
                                        <span><strong>Jonathan Baudilio Hidalgo Perez</strong>&nbsp;&nbsp;</span><span className="badge badge-warning">Rabbitmq</span>
                                    </li>
                                    <li className="list-group-item">
                                        <span><strong>Abner Abisai Hernández Vargas</strong>&nbsp;&nbsp;</span><span className="badge badge-primary">PubSub</span>
                                    </li>
                                    <li className="list-group-item">
                                        <span><strong>Asunción Mariana Sic Sor</strong>&nbsp;&nbsp;</span><span className="badge badge-info">Grpc</span>
                                    </li>
                                    <li className="list-group-item">
                                        <span><strong>José Orlando Wannan Escobar</strong>&nbsp;&nbsp;</span><span className="badge badge-success">NATS</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="card-footer text-right">
                                <strong><span className="badge badge-info">UNIVERSIDAD DE SAN CARLOS DE GUATEMALA</span></strong>
                                <br/>
                                <strong><span className="badge badge-info">SISTEMAS OPERATIVOS 1</span></strong>
                                <br/>
                                <strong><span className="badge badge-info">2021</span></strong>
                            </div>
                        </div>
                        <div className="card border-primary mb-3" id="RegionM">
                            <div className="card-header">
                                <h2>Region con más infectados</h2>
                            </div>
                            <div className="card-body">
                                <h1><strong>{this.state5.Region}</strong></h1>
                                CANTIDAD DE INFECTADOS: <span className="badge badge-secondary">{this.state5.cantidad}</span>
                            </div>
                            <div className="card-footer text-right">
                                <strong>Last Update on:</strong>&nbsp;<span className="badge badge-info">{this.state.curTime}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col col-lg-8 col-md-12 col-sm-12">
                        <div className="card border-primary mb-3" id="CEegiones">
                            <div className="card-header">
                                <h2>Casos Infectados por InfectedType </h2>
                            </div>
                            <div className="card-body">
                                <Pie data={this.state1.data} opciones={this.state1.opciones}/>
                            </div>
                            <div className="card-footer text-right">
                                <strong>Last Update on:</strong>&nbsp;<span className="badge badge-info">{this.state.curTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col col-lg-6 col-md-6 col-sm-12">
                        <div className="card border-primary mb-3" id="top5Pacientes">
                            <div className="card-header">
                                <h2>Top 5 Ultimos Casos Registrados</h2>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <Table data={this.table_Headers} ref={this.childPacientes1}/>
                                </div>
                            </div>
                            <div className="card-footer text-right">
                                <strong>Last Update on:</strong>&nbsp;<span className="badge badge-info">{this.state.curTime}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col col-lg-6 col-md-6 col-sm-12">
                        <div className="card border-primary mb-3" id="IT">
                            <div className="card-header">
                                <h2>Casos Infectados por State</h2>
                            </div>
                            <div className="card-body">
                                <Pie data={this.state2.data} opciones={this.state2.opciones}/>
                            </div>
                            <div className="card-footer text-right">
                                <strong>Last Update on:</strong>&nbsp;<span className="badge badge-info">{this.state.curTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col col-lg-12 col-md-12 col-sm-12">
                        <div className="card border-primary mb-3" id="RangoEdades">
                            <div className="card-header">
                                <h2>Rango de Edades (Pacientes)</h2>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <Bar data={this.state3.data} options={this.state3.opciones} legend={this.state3.legend}/>
                                </div>
                            </div>
                            <div className="card-footer text-right">
                                <strong>Last Update on:</strong>&nbsp;<span className="badge badge-info">{this.state.curTime}</span>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="row">
                    <div className="col col-lg-12 col-md-12 col-sm-12">
                        <div className="card border-primary mb-3" id="top5departamentosfunnel">
                            <div className="card-header">
                                <h2>Top 5 departamentos infectados</h2>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <CanvasJSChart options = {options} onRef={ref => this.chart5 = ref}/>
                                </div>
                            </div>
                            <div className="card-footer text-right">
                                <strong>Last Update on:</strong>&nbsp;<span className="badge badge-info">{this.state.curTime}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}
