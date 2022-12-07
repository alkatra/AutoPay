module.exports = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.status(403).redirect("/");
  }
};
