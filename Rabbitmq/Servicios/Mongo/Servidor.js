const express = require('express');
const app = new express();


const MongoCliente = require("mongodb").MongoClient;

//credenciales de la base de datos 
const DB_URI =  'mongodb+srv://jon:123@cluster0.hzs2w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';


//Nos conectamos a la base de datos 
var db;
MongoCliente.connect(DB_URI,{useUnifiedTopology:true},(err,client)=>{
    if(err)throw(err)
    db = client.db("RabbitUsers");
})


app.use(express.json({limit:'5mb',extended: true}));
 
//hacemos un post a la coleccion 

app.post('/',async(req,res)=>{
    const data = req.body;

    try {
        let Collection = db.collection("Users");
        let result    = await Collection.insertOne(data);
        res.json(result.ops[0])
    } catch (error) {
        console.log(error)
        res.status(500).json({'message':'Falied'});
    }
});


app.get('/',(req,res)=>{
    res.json({message:'Todo Bien'})
});


app.listen(5000);

