const express = require("express");
const router = express.Router();
var User = require("../models/user");
var Token = require("../models/token");
var Client = require("../models/client");
const bcrypt = require("bcrypt");
const isAuth = require("../middleware/isAuth");
const isNotAuth = require("../middleware/isNotAuth");
const short = require("short-uuid");
const API = require("./payment.js");
router.use("/payment", API);

async function getUserID(username) {
  let results = await User.find({ username: username });
  return results[0]._id;
}

router.get("/adduser", async function (req, res) {
  const testUser = new User();
  testUser.username = "sagartest";
  testUser.password = await bcrypt.hash("password", 10);
  await testUser.save();
  res.status(200).send("Done");
});

router.post("/login", isNotAuth, async function (req, res) {
  console.log("Hhhh");
  let response = await User.find({ username: req.body.username });
  if (response.length == 0) {
    res.status(404).send({
      message: "Unable to find user.",
    });
  } else {
    bcrypt.compare(
      req.body.password,
      response[0].password,
      async function (err, resp) {
        if (err) {
          res.status(500).send({ message: "Server Error." });
        }
        if (resp) {
          req.session.isAuth = true;
          req.session.username = req.body.username;
          res.status(200).send("Success");
        } else {
          res.status(403).send({ message: "Incorrect Password." });
        }
      }
    );
  }
});

router.get("/deletetest", isAuth, async function (req, res) {
  await Client.deleteMany({ name: "John Doe" });
  await Client.deleteOne({ name: "Jane Doe" });
  // await User.findOneAndUpdate({ username: "sagar" }, { $set: { clients: [] } });
  // let results = await User.find();
  // let results = await Token.find();
  // let results = await Token.deleteMany({});
  let results = await Client.find();
  res.send(results);
});

router.get("/test", async function (req, res) {
  // await Client.deleteMany({ name: "John Doe" });
  // await Client.deleteOne({ name: "Jane Doe" });
  // await User.findOneAndUpdate({ username: "sagar" }, { $set: { clients: [] } });
  // let results = await User.find();
  // let results = await Token.find();
  // let results = await Token.deleteMany({});
  let results = await Client.find();
  res.send(results);
});

router.get("/clients", isAuth, async function (req, res) {
  let results = await Client.find(
    {
      merchantID: await getUserID(req.session.username),
    },
    "name totalSuccess"
  );
  res.send(results);
  // res.send(["a", "b", "d"]);
});

router.get("/client/:id", isAuth, async function (req, res) {
  let result = await Client.findOne({ _id: req.params.id });
  let merchantID = result.merchantID;
  let userID = await getUserID(req.session.username);
  try {
    if (userID == merchantID) {
      let payments = [];
      result.payments.forEach((e, i) => {
        payments.push({
          _id: e._id,
          amount: e.amount,
          paymentFrequency: e.paymentFrequency,
          timesRecurringLeft: e.timesRecurringLeft,
          ignoreLastPayment: e.ignoreLastPayment,
          startDate: e.startDate,
          lastPayment: e.lastPayment ? e.lastPayment : e.startDate,
          lastStatus:
            e.paymentHistory.length > 0
              ? e.paymentHistory[e.paymentHistory.length - 1]
                  .gatewayResponseMessage
              : "Unattempted",
          lastAttempted: e.lastAttempted ? e.lastAttempted : "Unattempted",
          successCount: e.successCount ? e.successCount : "Unattempted (0)",
        });
      });
      res.status(200).send({
        _id: result._id,
        name: result.name,
        number: result.number,
        itemName: result.itemName,
        totalSuccess: result.totalSuccess,
        payments: payments,
      });
    } else {
      res.status(400).send({ message: "Something went wrong" });
    }
  } catch (e) {
    console.log(e);
    res.status(400).send({ message: "Something went wrong" });
  }
});

router.post("/client", isAuth, async function (req, res) {
  try {
    let client = new Client(req.body);
    // client = req.body;
    const array = req.ip.split(":");
    const remoteIP = array[array.length - 1];
    client.merchantID = await getUserID(req.session.username);
    client.paymentToken = "";
    client.clientIP = remoteIP;
    client.totalSuccess = 0;
    let code = (client.customerCode = short.generate());
    let response = await client.save();
    response = await Client.findOne({ customerCode: code });
    let id = response._id;
    await User.findOneAndUpdate(
      { username: req.session.username },
      { $push: { clients: { id: id } } }
    );
    res.status(200).send({ link: "https://alkatra.com/payment/" + id });
  } catch (e) {
    res.status(500).send("Something went wrong.");
  }

  // number: Number,
  //     itemName: String,
  //     bondAmount: Number,
  //     weeklyRent: Number,
  //     startDate: Date,
  //     payments: Array,
});

// payment related

router.get("/testSchedule", isAuth, async function (req, res) {
  res.send("scheduled");
});

router.get("/endSchedule", isAuth, async function (req, res) {
  res.send("ended schedule");
});

module.exports = router;
