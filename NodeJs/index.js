const express = require('express');
const mongoClient = require('mongodb').MongoClient
const urlMongo = "mongodb://localhost:27017/"

const app = express();
const port = process.env.port || 8080;

app.get('/', (req, res) => {
    console.log('inicio de api')
    res.send('API SOPES 1 :D');
});

app.get('/create', (req, res) => {
    var bdatos = false, coleccion = false;
    //crear la BD
    mongoClient.connect(urlMongo + 'test', function(err, db){
        if (err) throw res.json({'mensaje':err});
        db.close();
        console.log('Base de datos creada');
        bdatos = true;
    });

    //luego crear la colección
    mongoClient.connect(urlMongo, function(err, db){
        if (err) throw res.json({'mensaje':err});
        var baseD = db.db('test');
        baseD.createCollection('usuario', function(err, res){
            if (err) throw res.json({'mensaje':err});
            db.close();
            console.log('Colección creada!');
            coleccion = true;
        });
    });

    if (bdatos && coleccion) res.send('TODO BIEN!');
});

//registrar nuevo "usuario"
app.post('/nuevoRegistro', (req, res) => {
    
});

//devolver todos los usuarios

app.listen(port, () => {console.log(`Server corriendo en puerto ${port}!`) });