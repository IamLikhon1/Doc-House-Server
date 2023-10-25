const express = require("express")
const cors= require("cors")
const app = express();
const port= process.env.PORT || 5000;
require("dotenv").config()

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.snwbd1q.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const docCollection = client.db('doc-House').collection('docCollection');
    const storeCollection =client.db('doc-House').collection('store');

    app.get('/allDoc',async(req,res)=>{
        const search=req.query.search;
        const sort=req.query.sort;
        const query={name:{$regex:search, $options:'i'}}
        const sortOptions={
            sort:{
                'price':sort==='asc'? 1 : -1    
            }
        }
        const docs = await docCollection.find(query,sortOptions).toArray();
        res.send(docs)
    });

    app.post('/postData', async (req, res) => {
      const doc = req.body;
      const result = await storeCollection.insertOne(doc);
      res.send(result);
    });

    app.get('/getData', async (req, res) => {
      const result = await storeCollection.find().toArray();
      res.send(result);
    });

    app.delete('/deleteData/:id', async (req, res) => {
      const id=req.params.id;
      const query={_id:new ObjectId(id)};
      const result=await storeCollection.deleteOne(query);
      res.send(result);
    });

    app.patch('/updateData/:id', async (req, res) => {
      const id=req.params.id;
      const query={_id:new ObjectId(id)};
      const options={upsert:true};
      const data={
        $set:{
          role:'pending'
        }
        
      }
      const result=await storeCollection.updateOne(query,data,options);
      res.send(result);
    });

    app.put('/updateDataPut/:id', async (req, res) => {
      const id=req.params.id;
      const update=req.body;
      const query={_id:new ObjectId(id)};
      const options={upsert:true};
      const data={
        $set:{
          name:update.name,
          number:update.number,
        }
        
      }
      const result=await storeCollection.updateOne(query,data,options);
      res.send(result);
    });


    app.get('/getData/:id',async(req, res) =>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await storeCollection.findOne(query);
      res.send(result);
    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Doc-House Is running')
})
app.listen(port,()=>{
    console.log(`Doc-House is running on port: ${port}`)
})