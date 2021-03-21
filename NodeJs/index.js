const express = require('express');
const mongoClient = require('mongodb').MongoClient
const urlMongo = "mongodb://db:27017/"
const nameDB = 'dataProject1';
const fs = require('fs');

const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.json({ limit: '5mb', extended: true }));

const port = 8080;


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

app.get('/create', (req, res) => {
    //crear la BD
    mongoClient.connect(urlMongo + 'dataProject1', function(err, db){
        if (err) throw err;
        db.close();
        console.log('Base de datos creada');
    });

    //luego crear la colección
    mongoClient.connect(urlMongo, function(err, db){
        if (err) throw err;
        var baseD = db.db(nameDB);
        baseD.createCollection('usuario', function(err, res){
            if (err) throw err;
            db.close();
            console.log('Colección creada!');
        });
    });
    res.send('TODO BIEN!');
});

/* curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"name": "usuario","location": "guatemala","age": "33","infectedtype": "infeccion","state": "guatemala"}' \
  http://localhost:8080/nuevoRegistro
*/
//registrar nuevo "usuario"
app.post('/nuevoRegistro', (req, res) => {
    const data = req.body;
    
    mongoClient.connect(urlMongo, function(err, db){
        if (err) throw err;
        var baseD = db.db(nameDB)
        var user = {
            "name": data.name,
            "location": data.location,
            "age": data.age,
            "infectedtype": data.infectedtype,
            "state": data.state,
            "way": data.way
        }

        baseD.collection('usuario').insertOne(user, function(err, res){
            if (err) throw err;
            console.log('Registro ' + user + ' insertado!');
            db.close();
        });
    });

    res.send('Registro Insertado!');
    res.status(202);
});

//devolver todos los usuarios
app.get('/obtenerUsuarios', (req, res) => {
    var resultado;
    mongoClient.connect(urlMongo, function(err, db) {
        if (err) throw err;
        var dbo = db.db(nameDB);


        dbo.collection("usuario").find({}).toArray(function(err, result) {
          if (err) throw err;
          resultado = JSON.stringify(result);
          console.log(result);
          db.close();
        });
    }); 
    console.log("------\n" + resultado);
    res.send(resultado);
});

//---------------------- METODOS
//Top n departamentos infectados. (Gráfica de Funnel)
function top_(visitados,num){
    const lista = []
    const filtro=[]
    //listamos solo datos que necesitamos
    visitados.forEach(element => {
        lista.push(element.location.toLowerCase())
    });
    //quitamos duplicados
    const lista2 = lista.filter((item,index)=>{
        return lista.indexOf(item) == index;
      })
    //comparamos con el listado principal e insertamos
    lista2.forEach(data => {
        contador =0;
        visitados.forEach(data2 => {
            if(data==data2.location.toLowerCase()){
                contador+=1
            }
        });
        filtro.push({
            location:data,
            total: contador
        })
    }); 
    //retornamos lista ordenada y limitada a lo que entre
    return filtro.sort(((a, b) => b.total - a.total)).slice(0,num);
}
//porcentaje de casos infectados por state.
function infect_(visitados){
    const lista = []
    const filtro=[]
    //listamos solo datos que necesitamos
    visitados.forEach(element => {
        lista.push(element.state.toLowerCase())
    });
    //quitamos duplicados
    const lista2 = lista.filter((item,index)=>{
        return lista.indexOf(item) == index;
      })
    //sacamos el porcentaje
    lista2.forEach(data => {
        contador =0;
        visitados.forEach(data2 => {
            if(data==data2.state.toLowerCase()){
                contador+=1
            }
        });
        var porcentaje = ((contador*100)/lista.length);
        filtro.push({
            state: data,
            porcent: porcentaje
        })
    }); 
    return filtro;
}
//Tipo infectado 
function type_(visitados){
    const lista = []
    const filtro=[]
    //listamos solo datos que necesitamos
    visitados.forEach(element => {
        lista.push(element.infectedtype.toLowerCase())
    });
    //quitamos duplicados
    const lista2 = lista.filter((item,index)=>{
        return lista.indexOf(item) == index;
      })
    //sacamos el porcentaje
    lista2.forEach(data => {
        contador =0;
        visitados.forEach(data2 => {
            if(data==data2.infectedtype.toLowerCase()){
                contador+=1
            }
        });
        var porcentaje = ((contador*100)/lista.length);
        filtro.push({
            infectedtype: data,
            porcent: porcentaje
        })
    }); 
    return filtro;
}
/// conexion
//Nos conectamos a la base de datos 
var db;
mongoClient.connect(urlMongo,{useUnifiedTopology:true},(err,client)=>{
    if(err)throw(err)
    db = client.db(nameDB);
})


//------------------------  Rutas 2.0

app.get('/Top5', (req, res) => {
    var resultado;
    mongoClient.connect(urlMongo, function(err, db) {
        if (err) throw err;
        var dbo = db.db(nameDB);


        dbo.collection("usuario").find({}).toArray(function(err, result) {
          if (err) throw err;
          resultado = JSON.stringify(result);
          console.log(result);
          db.close();
        });
    }); 
    console.log("------\n" + resultado);
    res.json(top_(resultado,5))
});

app.get('/state', (req, res) => {
    var resultado;
    mongoClient.connect(urlMongo, function(err, db) {
        if (err) throw err;
        var dbo = db.db(nameDB);


        dbo.collection("usuario").find({}).toArray(function(err, result) {
          if (err) throw err;
          resultado = JSON.stringify(result);
          console.log(result);
          db.close();
        });
    }); 
    console.log("------\n" + resultado);
    res.json(infect_(result))

});

app.get('/type', (req, res) => {
    var resultado;
    mongoClient.connect(urlMongo, function(err, db) {
        if (err) throw err;
        var dbo = db.db(nameDB);


        dbo.collection("usuario").find({}).toArray(function(err, result) {
          if (err) throw err;
          resultado = JSON.stringify(result);
          console.log(result);
          db.close();
        });
    }); 
    console.log("------\n" + resultado);
    res.json(type_(result))
});







//------------------   RUTAS
//Top 5 Departamentos mas infectados 
// app.get('/Top5',async (req,res)=>{
//     await db.collection("usuario").find({}).toArray(function(err,result){
//         if(err) throw err;
//         console.log(result)
//         res.json(top_(result,5))
//     })
// })

// // casos infectados por state.
// app.get('/state',async (req,res)=>{
//     await db.collection("usuario").find({}).toArray(function(err,result){
//         if(err) throw err;
//         console.log(result)
//         res.json(infect_(result))
//     })
// })

// // casos infectados por infectedtype.
// app.get('/type',async (req,res)=>{
//     await db.collection("usuario").find({}).toArray(function(err,result){
//         if(err) throw err;
//         console.log(result)
//         res.json(type_(result))
//     })
// })






app.listen(port, () => {console.log(`Server corriendo en puerto ${port}!`) });