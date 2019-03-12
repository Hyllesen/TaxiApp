const express = require("express");
const bodyParser = require("body-parser");
const mongoDbConnectionString = require("./config/mongodb");
const mongoose = require("mongoose");
const userRouter = require("./routes/users");
const PORT = 4000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/users", userRouter);

app.use((error, req, res, next) => {
  console.log(error);
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  const status = error.statusCode;
  const message = error.message;
  res.status(status).json({ message });
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
