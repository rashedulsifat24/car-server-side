
const express=require("express");
const cors=require("cors");
const { MongoClient } = require('mongodb');
const bodyParser=require("body-parser");
const ObjectId=require('mongodb').ObjectId;



const app=express();
const port = process.env.PORT || 5000;
//midle ware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const uri = "mongodb+srv://rashed123:rashed123@cluster0.uco8w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    console.log("succefully");
    const database = client.db("cars");
    const productCollection = database.collection("carscollection");
    const ordersCollection = database.collection("orders");
    const userCollection = database.collection("users");

    //add product
    app.post("/addproduct", async (req, res) => {
      const result = await productCollection.insertOne(req.body);
      res.json(result.insertedId);
    });

    //get product home
    app.get("/products", async (req, res) => {
      const result = await (
        await productCollection.find({}).toArray()
      ).slice(0, 6);
      res.json(result);
    });
    //get gallery product
    app.get("/gallery/products", async (req, res) => {
      const result = await await productCollection.find({}).toArray();
      res.json(result);
    });

    //get single purches product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const result = await productCollection.findOne({ _id: ObjectId(id) });
      res.json(result);
    });

    //orders purches
    app.post("/orders", async (req, res) => {
      const result = await ordersCollection.insertOne(req.body);
      res.send(result.acknowledged);
    });

    //my orders
    app.get("/allorders", async (req, res) => {
      const result = await ordersCollection
        .find({ email: req.query.email })
        .toArray();
      res.json(result);
    });

    // all orders
    app.get("/allorder", async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
      res.json(result);
    });

    //delet or cancel my order
    app.delete("/allorder/:id", async (req, res) => {
      const id = req.params.id;
      const result = await ordersCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result.acknowledged);
    });

    //delete product
    app.delete("/gallery/productsr/:id", async (req, res) => {
      const id = req.params.id;
      const result = await productCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result.acknowledged);
    });

    //sava user by register
    app.post("/users", async (req, res) => {
      const result = await userCollection.insertOne(req.body);
      // console.log(result);
    });

    //save user google login
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      // console.log(result);
      res.send(result);
    });

    //make admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const update = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, update);
      res.json(result);
    });

    //cheack user is admin
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const user = await userCollection.findOne(filter);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //updet order status
    app.put("/updetorder/:id", async (req, res) => {
      const id = req.params.id;
      const result = await ordersCollection.updateOne(
        { _id: ObjectId(id) },
        {
          $set: {
            status: "shipping",
          },
        }
      );
      res.json(result.modifiedCount);
    });

    //user rating
    app.put("/rating/:email", async (req, res) => {
      const email = req.params.email;
      const rating = req.body.rating;
      const filter = { email: email };
      const result = await userCollection.updateOne(filter, {
        $set: {
          rating: rating,
        },
      });
    });

    //get rating from users
    app.get("/users/rating", async (req, res) => {
      const users = await userCollection.find({}).toArray();
      res.json(users);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
        res.send("server is running")
})
app.listen(port,()=>{
       console.log("the port is right",port)
})