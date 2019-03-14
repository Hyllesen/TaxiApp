module.exports = (error, req, res, next) => {
  console.log(error);
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  const status = error.statusCode;
  const message = error.message;
  res.status(status).json({ message });
};
