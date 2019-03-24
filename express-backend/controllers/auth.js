const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../config/jwtSecret");

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (isPasswordCorrect) {
        const token = jwt.sign({ email: user.email }, jwtSecret);
        return res.json({ token });
      }
      const error = new Error(`Password does not match email ${email}`);
      error.statusCode = 401;
      throw error;
    }
    const error = new Error(`This email ${email} does not exist`);
    error.statusCode = 401;
    throw error;
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (await User.findOne({ email })) {
      const error = new Error(
        `An account with the mail ${email} already exists`
      );
      error.statusCode = 409;
      throw error;
    }

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
    next(err);
  }
};
