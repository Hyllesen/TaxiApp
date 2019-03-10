const User = require("../model/User");
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("You fetched a user!");
});

router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
