const express = require("express");
const bodyParser = require("body-parser");
const mongoDbConnectionString = require("./config/mongodb");
const mongoose = require("mongoose");
const User = require("./model/User");
const PORT = 4000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/users", (req, res) => {
  res.send("You fetched a user!");
});

app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

mongoose
  .connect(mongoDbConnectionString, { useNewUrlParser: true })
  .then(result => {
    console.log("Connected to Mongodb");
    app.listen(PORT, () => {
      console.log("Server is listening on PORT: " + PORT);
    });
  })
  .catch(err => {
    console.error(err);
  });
