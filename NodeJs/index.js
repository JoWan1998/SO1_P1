const express = require('express');
const mongoClient = require('mongodb').MongoClient
const urlMongo = "mongodb://db:27017/"
const nameDB = 'dataProject1';
const fs = require('fs');

const app = express();
const cors = require('cors');
const regiones =[
    {
        region: "Región VI o Suroccidente",
        departamentos: ["quetzaltenango","retalhuleu","San Marcos","Suchitepéquez","Sololá","Totonicapán"]
    },
    {
        region: "Región I o Metropolitana",
        departamentos: ["Guatemala"]
    },
    {
        region: "Región VII o Noroccidente",
        departamentos: ["Huehuetenango","Quiché"]
    },
    {
        region: "Región V o Central",
        departamentos: ["Chimaltenango","Sacatepéquez","Escuintla"]
    },
    {
        region: "Región II o Verapaz",
        departamentos: ["Alta Verapaz","Baja Verapaz"]
    },
    {
        region: "Región III o Nororiente",
        departamentos: ["Chiquimula","El Progreso","Izabal","Zacapa"]
    },
    {
        region: "Región IV o Suroriente",
        departamentos: ["Jutiapa","Jalapa","Santa Rosa"]
    },
    {
        region: "Región VIII o Petén",
        departamentos: ["Petén"]
    }
]


app.use(cors());
app.use(express.json());
app.use(express.json({ limit: '5mb', extended: true }));

const port = 8080;

mongoClient.connect(urlMongo, { useUnifiedTopology: true })
.then(client => {
    console.log("Conectado a la base de datos!")
    const db = client.db(nameDB)
    const coleccion = db.collection('usuario')

    app.get('/', (req, res) => {
        console.log('inicio de api')
        res.send('API SOPES 1 :D');
    });

    app.post('/locus', (req, res) => {
        console.log("ENVIO-----------------------");
        console.log(req.body);
        console.log("RESPUESTA-------------------");
        res.send(req.body);
    });

    app.get('/ram', (req, res) => {
        const html = fs.readFileSync('/elements/procs/ram-module','utf-8');
        let texto = html.toString();
        res.send(texto);
    });

    app.get('/procesos', (req, res) => {
        const html = fs.readFileSync('/elements/procs/procesos','utf-8');
        let texto = html.toString();
        res.send(texto);
    });

    /* curl --header "Content-Type: application/json" \
    --request POST \
    --data '{"name": "usuario","location": "guatemala","age": "33","infectedtype": "infeccion","state": "guatemala"}' \
    http://localhost:8080/nuevoRegistro
    */
    app.post('/nuevoRegistro', (req, res) => {
        const data = req.body;
		if(data.name != null && data.location != null && data.age != null && data.infectedtype != null && data.state != null)
		{
			
			const user = {
				"name": data.name,
				"location": data.location,
				"age": data.age,
				"infectedtype": data.infectedtype,
				"state": data.state,
				"way": data.way
			}

			coleccion.insertOne(user)
			.then(result => {
				//console.log(result);
				res.send('Registro Insertado!');
			})
			.catch(error => console.error("Error al insertar un registro: ", error));
		}
		else{
			res.send('Nulls encontrados');
		}
    });

    app.get('/deleteAll', (req, res) => {
        coleccion.drop().then(result => {
            console.log("Eliminado!")
            res.send("Eliminado!")
        }).catch(err => console.error(err))
    });

    //----------------------------------------------- ENDPOINT PARA LA VISTA DE METRICAS ----------------------------------------------------------
    //Tabla de datos recopilados (ordenados con el último primero) con la capacidad de filtrarse por la ruta de ingreso (Todas, NATS, gRPC, RabbitMQ o Google PubSub).
    
    app.get('/obtenerUsuarios', async (req, res) => {
        coleccion.find().toArray()
        .then(results => {
            //console.log(results);
            res.json(results)
        })
        .catch(error => console.error(error))
    });

    // casos  de region - region mas infectada
    app.get('/region',async (req,res)=>{
        await coleccion.find().toArray()
        .then(result => {
            res.json(regiM_(result,5))
        })
        .catch(err => console.error("Error en region: ", err))
    });

    //Top 5 Departamentos mas infectados - grafica de Funnel
    app.get('/Top5', async (req, res) => {
        coleccion.find().toArray()
        .then(results => {
            //console.log(results);
            res.json(top_(results,5))
        })
        .catch(error => console.error(error))
    });

    // casos infectados por state - grafica circular de porcentaje
    app.get('/state', async (req, res) => {
        coleccion.find().toArray()
        .then(results => {
            //console.log(results);
            res.json(infect_(results))
        })
        .catch(error => console.error(error))
    });

    // casos infectados por infectedtype - grafica circular de porcentaje
    app.get('/type', async (req, res) => {
        coleccion.find().toArray()
        .then(results => {
            //console.log(results);
            res.json(type_(results))
        })
        .catch(error => console.error(error))
    });

    //tabla con los ultimos 5 casos registrados
    app.get('/top5/pacientes', async (req,res)=> {
        await coleccion.find( { name: { $ne: null } }).sort({$natural:-1}).limit(5).toArray()
        .then(result => {
            //console.log(result.length);
            res.json(result);
        })
        .catch(err => console.error("Error Top5 / pacientes:\n", err))
    });

    app.listen(port, () => {console.log(`Server corriendo en puerto ${port}!`) });
    
})
.catch(console.error)

//---------------------- METODOS
//Top n departamentos infectados. (Gráfica de Funnel)
function top_(visitados,num){
    const lista = []
    //listamos solo datos que necesitamos
    visitados.forEach(element => {
        if(element.location != null)
        {
            var __in = false;
            lista.forEach(element1=>{
                if(element1.location === element.location.toLowerCase())
                {
                    element1.valor = element1.valor + 1;
                    __in = true;
                }
            })
            if(!__in) lista.push( { location: element.location.toLowerCase(), valor: 1});
        }

    });

    //retornamos lista ordenada y limitada a lo que entre
    return lista.sort(((a, b) => b.valor - a.valor)).slice(0,num);
}
//porcentaje de casos infectados por state.
function infect_(visitados){
    const lista = []
    let cantidad = 0;
    //listamos solo datos que necesitamos
    visitados.forEach(element => {
        if(element.state!= null)
        {
            var __k = false;
            lista.forEach(element1 =>
            {
                if(element1.state === element.state.toLowerCase())
                {
                    element1.count = element1.count + 1;
                    __k = true;
                }
            });
            if(!__k) lista.push({ state: element.state.toLowerCase(), count: 1, porcent: 0});
        }

    });

    lista.forEach(element=>
    {
        cantidad += element.count;
    });

    lista.forEach(element1=>
    {
        element1.porcent = (element1.count/cantidad)*100;
    })
    return lista;
}
//Tipo infectado 
function type_(visitados){
    const lista = []
    let cantidad = 0;
    //listamos solo datos que necesitamos
    visitados.forEach(element => {
        if(element.infectedtype != null)
        {
            var _k= false;
            lista.forEach(element1=>
            {
                if(element1.infectedtype === element.infectedtype.toLowerCase())
                {
                    element1.count = element1.count + 1;
                    _k = true;
                }
            })
            if(!_k) lista.push({ infectedtype: element.infectedtype.toLowerCase(), count: 1, porcent: 0});
        }

    });
    //quitamos duplicados
    lista.forEach(element=>
    {
        cantidad += element.count;
    })

    lista.forEach(element=>
    {
        element.porcent = (element.count/cantidad)*100;
    })

    return lista;
}
//Region
function regiM_(visitados,num){
    const lista = []
    //listamos solo datos que necesitamos
    visitados.forEach(element => {
        if(element.location != null)
        {
            var _k = false;
            var _region = '';
            regiones.forEach(regiones=>
            {
                if(_region === '')
                {
                    regiones.departamentos.forEach(departamento=>
                    {
                        if(departamento.normalize('NFD').replace(/[\u0300-\u036f]/g,"").toUpperCase() === element.location.normalize('NFD').replace(/[\u0300-\u036f]/g,"").toUpperCase())
                        {
                            _region = regiones.region;
                        }
                    })
                }
            })
            lista.forEach(element1=>
            {
                if(element1.region === _region)
                {
                    element1.total = element1.total + 1;
                    _k = true;
                }
            });

            if(!_k)
            {

                if(_region!='') lista.push({region: _region, total: 1});
            }
        }

    });
    //retornamos lista ordenada y limitada a lo que entre
    return lista.sort(((a, b) => b.total - a.total)).slice(0,num);
}