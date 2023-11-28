const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('LifeFlow Server!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.thkxg3l.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  const usersCollection = client.db('lifeflow').collection('users')
  const DonatReqsCollection = client.db('lifeflow').collection('donation-requests')
  try {
    // await client.connect();

    // Posts
    app.post('/users',async(req,res)=>{
      const user = req.body
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })

    app.post('/donation-reqs',async(req,res)=>{
      const requests = req.body
      const result = await DonatReqsCollection.insertOne(requests)
      res.send(result)
    })

    // Gets
    app.get('/user',async(req,res)=>{
      const email = req.query.email
      const result = await usersCollection.findOne({email: email})
      
      res.send(result)
    })

    app.get('/dashboard-donation-reqs',async(req,res)=>{
      const email = req.query.email
      const result = await DonatReqsCollection.find({requesterEmail:email}).limit(3).toArray()
      res.send(result)
    })

    app.get('/donation-reqs',async(req,res)=>{
      const email = req.query.email
      const result = await DonatReqsCollection.find({requesterEmail:email}).toArray()
      res.send(result)
    })

    app.get('/donation-req/:id',async(req,res)=>{
      const id = req.params.id
      const email = req.query.email
      const filter = {
        requesterEmail: email,
        _id : new ObjectId(id)
      }
      const result = await DonatReqsCollection.findOne(filter)
      res.send(result)
    })

    // Puts
    app.patch('/user',async(req,res)=>{
      const user = req.body
      const email = req.query.email
      const query = {
        email: email
      }
      const updateDoc = {
        $set: {...user}
      };
      const result =await usersCollection.updateOne(query,updateDoc)
      res.send(result)
    })

    app.patch('/update-request',async(req,res)=>{
      const reqData = req.body
      const email = req.query.email
      const query = {
        requesterEmail: email
      }
      const updateDoc = {
        $set: {...reqData}
      };
      const result =await DonatReqsCollection.updateOne(query,updateDoc)
      res.send(result)
      console.log(query,updateDoc);
    })

    // Delete
    
    app.delete('/delete-request/:id',async(req,res)=>{
      const id = req.params.id
      const filter = {
        _id: new ObjectId(id)
      }
      const result = await DonatReqsCollection.deleteOne(filter)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`LifeFlow server running on port ${port}`)
})