const express = require("express");
const mongoose = require("mongoose");
const PORT = 4000;
const app = express();

const mongoDbConnectionString =
  "mongodb://testUser:testtest1@ds251332.mlab.com:51332/taxiapp-demo";

app.get("/user", (req, res) => {
  res.send("You fetched a user!");
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
