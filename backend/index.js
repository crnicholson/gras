const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");

const client = new MongoClient(
  "mongodb://root:example@hackclub.app:43463/?authSource=admin"
);
const gras = client.db("gras").collection("users");

const app = express();
const port = 38783;

app.use(cors());
app.use(express.json());

app.post("/save-progress", async (req, res) => {
  const data = req.body;

  console.log("data:", data);

  try {
    await client.connect();

    const existingUser = await gras.findOne({ id: data.id });

    if (existingUser) {
      await gras.updateOne({ id: data.id }, { $set: data });
      res.status(200).send({});
      return;
    } else {
      await gras.insertOne(data);
      res.status(200).send({});
      return;
    }
  } catch (error) {
    console.error("error:", error);
    res.status(400).send({ error: "failed to save progress" });
  } finally {
    await client.close();
  }
});

app.post("/load-progress", async (req, res) => {
  const data = req.body;

  console.log("fetching data from user:", data.id);

  try {
    await client.connect();

    const user = await gras.findOne({ id: data.id });

    if (user) {
      console.log("user fields:", user);
      res.status(200).send(user);
      return;
    }
  } catch (error) {
    console.error("error:", error);
    res.status(400).send({});
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
