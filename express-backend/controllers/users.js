const User = require("../model/User");

exports.getUser = (req, res) => {
  res.send("You fetched a user!");
};

exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
};
