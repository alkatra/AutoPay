module.exports = (req, res, next) => {
  if (req.session.username == "sagar") {
    next();
  } else {
    res.status(403).send("Unauthorized.");
  }
};
