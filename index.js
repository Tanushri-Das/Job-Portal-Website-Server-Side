const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tdjlbxg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const categoriesCollection = client
      .db("JobPortal")
      .collection("categories");
    const companiesCollection = client.db("JobPortal").collection("companies");
    const contactsCollection = client.db("JobPortal").collection("contacts");
    const jobsCollection = client.db("JobPortal").collection("jobs");
    const reviewsCollection = client.db("JobPortal").collection("reviews");
    const usersCollection = client.db("JobPortal").collection("users");
    const appliedJobsCollection = client
      .db("JobPortal")
      .collection("appliedJobs");

    app.get("/categories", async (req, res) => {
      const result = await categoriesCollection.find().toArray();
      res.send(result);
    });
    app.get("/companies", async (req, res) => {
      const result = await companiesCollection.find().toArray();
      res.send(result);
    });
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });
    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });
    app.post("/contact", async (req, res) => {
      const newItem = req.body;
      const result = await contactsCollection.insertOne(newItem);
      res.send(result);
    });

    // user related api
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      console.log("existingUser", existingUser);
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const { email } = req.query; // Destructure email from query parameters

      try {
        let result;
        if (email) {
          // If email is provided, find user by email
          result = await usersCollection.findOne({ email: email });
          if (!result) {
            return res.status(404).send({ message: "User not found" });
          }
        } else {
          // If no email is provided, return all users
          result = await usersCollection.find().toArray();
        }

        res.send(result);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });
    // applied
    app.post("/applied-jobs", async (req, res) => {
      const item = req.body;
      const result = await appliedJobsCollection.insertOne(item);
      res.send(result);
    });

    app.get("/applied-jobs", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await appliedJobsCollection.find(query).toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Job Portal Website server side is running");
});
app.listen(port, () => {
  console.log(`Job Portal Website server side is running on port ${port}`);
});
