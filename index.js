const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware
// app.use(cors())
const corsConfig = {
    origin: "*",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}
app.use(cors(corsConfig))
app.options("", cors(corsConfig))

app.use(express.json())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xsalsjk.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");


        const toysCollections = client.db('toysDB').collection('toys')

        // add toy
        app.post('/add-toy', async (req, res) => {
            const newToy = req.body;
            const result = await toysCollections.insertOne(newToy);
            res.send(result);
        })

        // get toys by category, sort, limit, email, search

        app.get('/toys', async (req, res) => {

            const { category, sort, limit, email, search } = req.query;

            let query = toysCollections.find();

            if (category) {
                query = query.filter({ category });
            }

            if (email) {
                query = query.filter({ sellerEmail: email });
            }

            if (search) {
                query = query.filter({ name: search });
            }

            if (sort === 'asc') {
                query = query.sort({ price: 1 });
            } else if (sort === 'desc') {
                query = query.sort({ price: -1 });
            }

            if (limit) {
                const limitValue = parseInt(limit);
                query = query.limit(limitValue);
            }

            try {
                const products = await query.toArray();
                res.send(products);
            } catch (err) {
                console.error('Failed to fetch products:', err);
                res.status(500).send('Internal Server Error');
            }
        })

        // get toys by id

        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollections.findOne(query)
            res.send(result);
        })

        // delete toy by id
        app.delete('/toys/:id', async (req, res) => {
            id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await toysCollections.deleteOne(query)
            res.send(result)
        })

        // update toy
        app.put('/toys/:id', async (req, res) => {
            const id = req.params.id
            const newToy = req.body
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }

            const updatedToy = {
                $set: {
                    price: newToy.price,
                    description: newToy.description,
                    quantity: newToy.quantity
                }
            }

            const result = await toysCollections.updateOne(filter, updatedToy, options)
            res.send(result)
        })





    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }


}


run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})