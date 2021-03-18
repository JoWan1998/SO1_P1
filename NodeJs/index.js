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

app.listen(port, () => {console.log(`Server corriendo en puerto ${port}!`) });