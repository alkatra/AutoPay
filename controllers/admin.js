const express = require("express");
const router = express.Router();
var User = require("../models/user");
var Logs = require("../models/log");
var Token = require("../models/log");
var Client = require("../models/log");

const isAdmin = require("../middleware/isAdmin");
router.use(isAdmin);

router.get("/clients", async function (req, res) {
  let results = await Client.find();
  res.send(results);
});

router.get("/rundown", async function (req, res) {
  let results = await Client.find(
    {},
    "payments.amount payments.paymentHistory name merchantID totalSuccess"
  );
  res.send(results);
});

router.get("/users", async function (req, res) {
  let results = await User.find();
  res.send(results);
});

router.get("/tokens", async function (req, res) {
  let results = await Token.find();
  res.send(results);
});

router.get("/logs", async function (req, res) {
  let results = await Logs.find();
  res.send(results);
});

module.exports = router;
