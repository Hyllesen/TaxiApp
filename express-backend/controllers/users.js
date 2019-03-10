const User = require("../model/User");
const bcrypt = require("bcrypt");

exports.getUser = (req, res) => {
  res.send("You fetched a user!");
};

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });
    const result = await user.save();
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
};
