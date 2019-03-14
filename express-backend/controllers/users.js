const User = require("../model/User");

exports.getUsers = async (req, res, next) => {
  try {
    const usersFromDb = await User.find({});
    const users = usersFromDb.map(({ firstName, lastName, email }) => ({
      firstName,
      lastName,
      email
    }));
    return res.json({ users });
  } catch (err) {
    next(err);
  }
};
