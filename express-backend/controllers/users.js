const User = require("../model/User");
const bcrypt = require("bcrypt");

exports.getUser = (req, res) => {
  res.send("You fetched a user!");
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      return res.send("You are logged in!");
    }
    return res.send(`Password does not match email ${email}`);
  }
  return res.send(`This email ${email} does not exist`);
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
