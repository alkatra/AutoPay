const express = require("express");
const router = express.Router();
const logger = require("../functions/logger");
var User = require("../models/user");
var Token = require("../models/token");
var Client = require("../models/client");
const schedule = require("node-schedule");
const isAuth = require("../middleware/isAuth");
const rule = new schedule.RecurrenceRule();
rule.hour = 3;
rule.minute = 50;
schedule.scheduleJob(rule, function () {
  logger.log("Scheduler activated.");
  takePendingPayments();
});

takePendingPayments();

async function getUserID(username) {
  let results = await User.find({ username: username });
  return results[0]._id;
}

async function getToken() {
  let results = await Token.find({});
  const now = new Date().toISOString();
  if (results[0] != undefined && results[0].expiresAt < now) {
    return results[0].accessToken;
  } else {
    await Token.deleteMany({});
    let response = await fetch(
      "https://welcome.api2.sandbox.auspost.com.au/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic MG9heGI5aThQOXZRZFhUc24zbDU6MGFCc0dVM3gxYmMtVUlGX3ZEQkEySnpqcENQSGpvQ1A3b0k2amlzcA==",
        },
        body: new URLSearchParams({
          audience: "https://api.payments.auspost.com.au",
          grant_type: "client_credentials",
        }),
      }
    );
    let json = await response.json();
    let expiry = new Date();
    expiry = new Date(expiry.getTime() - json.expires_in);
    let token = new Token();
    token.accessToken = json.access_token;
    token.expiresAt = expiry;
    await token.save();
    return json.access_token;
  }
}

router.get("/logs/", isAuth, async function (req, res) {
  try {
    let merchantID = await getUserID(req.session.username);
    let response = await Client.find(
      { merchantID: merchantID },
      "payments.paymentHistory name payments._id"
    );
    let payments = [];
    response.forEach((e, responseIndex) => {
      e.payments.forEach((payment, i) => {
        payment.paymentHistory.forEach((paymentLog) => {
          payments.push({
            name: response[responseIndex].name,
            createdAt: paymentLog.createdAt,
            amount: paymentLog.amount,
            gatewayResponseMessage: paymentLog.gatewayResponseMessage,
            ip: paymentLog.ip,
            orderId: paymentLog.orderId,
            clientID: response[responseIndex]._id,
            paymentID: payment._id,
          });
        });
      });
    });
    res.status(200).send(payments);
  } catch (e) {
    logger.log(e);
    res.status(500).send(e);
  }
});

router.delete("/", isAuth, async function (req, res) {
  //https://payments-stest.npe.auspost.zone/v2/orders/{orderId}/refunds
  let response = await fetch(
    "https://payments-stest.npe.auspost.zone/v2/orders/" +
      req.body.orderId +
      "/refunds",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + (await getToken()),
      },
      body: JSON.stringify({
        merchantCode: "5AR0055",
        ip: req.body.ip,
        amount: req.body.amount,
      }),
    }
  );
  logger.log(
    "$" + req.body.amount + " has been refunded for: " + req.body.clientID
  );
  await Client.findOneAndUpdate(
    { _id: req.body.clientID, "payments._id": req.body.paymentID },
    {
      $push: { "payments.$.paymentHistory": paymentJSON },
      $inc: { totalSuccess: payment.amount * -1 },
    }
  );
});

router.get("/paymentinformation/:id", async function (req, res) {
  try {
    let response = await Client.findOne(
      { _id: req.params.id },
      "payments paymentToken name number itemName"
    );

    if (response.paymentToken != "") {
      res.status(400).send({ message: "Payment method already exists." });
      return;
    }
    let strings = [];
    response.payments.forEach((e, i) => {
      let string = "";
      string = `$${e.amount / 100} ${
        e.timesRecurringLeft < 0
          ? "recurring until stopped "
          : "recurring " + e.timesRecurringLeft + " times"
      } starting at ${new Date(e.startDate).toISOString().substring(0, 10)}`;
      strings.push(string);
    });
    let message = {
      name: response.name,
      number: response.number,
      itemName: response.itemName,
      paymentSchedules: strings,
    };
    res.status(200).send(message);
  } catch (e) {
    logger.log(e);
    res.status(404).send(e);
  }
});

router.post("/token/:id", async function (req, res) {
  try {
    var result = await Client.findOne({ _id: req.params.id });
  } catch (e) {
    logger.log(e);
    res.status(500).send({ message: "Something went wrong." });
  }

  try {
    // get IP of client
    const array = req.ip.split(":");
    const remoteIP = array[array.length - 1];
    // Check if payment Token exists for user.
    if (result.paymentToken == "") {
      // Get Payment Token
      let response = await fetch(
        "https://payments-stest.npe.auspost.zone/v2/customers/" +
          result.customerCode +
          "/payment-instruments/token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + (await getToken()),
            token: req.body.token,
            ip: remoteIP,
          },
          body: JSON.stringify({}),
        }
      );
      if (response.status == 200 || response.status == 201) {
        let js = await response.json();

        await Client.findOneAndUpdate(
          { _id: req.params.id },
          { $set: { paymentToken: js.token } }
        );

        await takePendingPayments(req.params.id);
        res.status(200).send({ message: "Success" });
      }
    } else {
      res.status(500).send({ message: "Error with code: " + response.status });
    }
  } catch (e) {
    logger.log(e);
    res.status(404).send(e);
  }
});

router.post("/schedule", isAuth, async function (req, res) {
  try {
    let r = await Client.updateOne(
      { _id: req.body.clientID },
      { $push: { payments: req.body.payment } }
    );
    await takePendingPayments(req.body.clientID);
    res.status(200).send({ message: "Successful" });
  } catch (e) {
    logger.log(e);
    res.status(500).send({ message: "Something went wrong." });
  }
});

router.post("/changedate", isAuth, async function (req, res) {
  try {
    // if (hasDatePassed(Date.parse(new Date()), Date.parse(req.body.newDate))) {
    //   res.status(400).send({ message: "Error" });
    //   return;
    // }
    await Client.findOneAndUpdate(
      { _id: req.body.clientID, "payments._id": req.body.paymentID },
      {
        $set: {
          "payments.$.startDate": req.body.newDate,
          "payments.$.ignoreLastPayment": true,
        },
      }
    );
    await takePendingPayments(req.body.clientID);
    res.status(200).send({ message: "Successful" });
  } catch (e) {
    logger.log(e);
    res.status(500).send({ message: "Something went wrong." });
  }
});

router.post("/changeamount", isAuth, async function (req, res) {
  try {
    let r = await Client.findOneAndUpdate(
      { _id: req.body.clientID, "payments._id": req.body.paymentID },
      {
        $set: {
          "payments.$.amount": req.body.newAmount * 100,
        },
      }
    );
    res.status(200).send({ message: "Successful" });
  } catch (e) {
    logger.log(e);
    res.status(500).send({ message: "Something went wrong." });
  }
});

router.post("/stoppayments", isAuth, async function (req, res) {
  try {
    await Client.findOneAndUpdate(
      { _id: req.body.clientID, "payments._id": req.body.paymentID },
      {
        $set: {
          "payments.$.timesRecurringLeft": 0,
        },
      }
    );
    res.status(200).send({ message: "Successful" });
  } catch (e) {
    logger.log(e);
    res.status(500).send({ message: "Something went wrong." });
  }
});

router.get("/test", isAuth, async function (req, res) {
  await Client.updateOne(
    {
      _id: "638def737975dd1f0f235d29",
      "payments._id": "638def737975dd1f0f235d2b",
    },
    { $set: { "payments.$.lastPayment": "2022-11-28T00:02:35.998+11:00" } }
  );
  // await takePendingPayments();
  res.send("Done");
});

async function takePendingPayments(clientID) {
  let payments = 0;
  let client = Client.findOne({ _id: clientID });
  if (client.paymentToken == "") return;
  client.payments.forEach(async (payment, index) => {
    if (!payment.lastPayment) {
      if ((await takePayment(client._id, index)) == { message: "Success" })
        payments++;
    } else {
      let currentDate = new Date();
      let lastDate = payment.lastPayment; // change to last payment
      let frequency = payment.paymentFrequency;
      let overdue = isPaymentOverdue(currentDate, lastDate, frequency);
      if (overdue) {
        if ((await takePayment(client._id, index)) == { message: "Success" })
          payments++;
      }
    }
  });
  if (payments > 0) return { message: "Success" };
  return { message: "No payments taken." };
}

async function takePendingPayments() {
  let clients = await Client.find({});
  payments = 0;
  clients.forEach((client) => {
    if (client.paymentToken != "") {
      client.payments.forEach(async (payment, index) => {
        if (!payment.lastPayment || payment.ignoreLastPayment) {
          if ((await takePayment(client._id, index)) == { message: "Success" })
            payments++;
        } else {
          let currentDate = new Date();
          let lastDate = payment.lastPayment; // change to last payment
          let frequency = payment.paymentFrequency;
          let overdue = isPaymentOverdue(currentDate, lastDate, frequency);

          if (overdue) {
            if (
              (await takePayment(client._id, index)) == { message: "Success" }
            )
              payments++;
          }
        }
      });
    }
  });
  if (payments > 0) {
    return { message: "Success" };
  }
  return { message: "No payments taken." };
}

function isPaymentOverdue(currentDate, lastDate, frequency) {
  let daysPassed = (currentDate - lastDate) / 1000 / 60 / 60 / 24;

  if (frequency == "once") return true;
  if (frequency == "weekly" && daysPassed >= 7.0) return true;
  if (frequency == "fortnightly" && daysPassed >= 14.0) return true;
  if (frequency == "monthly" && daysPassed >= 30.4167) return true;
  return false;
}

function hasDatePassed(currentDate, lastDate) {
  let daysPassed = (currentDate - lastDate) / 1000 / 60 / 60 / 24;
  if (daysPassed >= 0) return true;
  return false;
}

async function takePayment(clientID, index) {
  let client = await Client.findOne({ _id: clientID });
  if (client.paymentToken == "")
    return { message: "Credit card information not stored." };
  let payment = client.payments[index];
  if (payment.timesRecurringLeft == 0)
    return { message: "Maximum payments have been taken." };

  if (payment.lastPayment != undefined && !payment.ignoreLastPayment) {
    let currentDate = new Date();
    let lastDate = payment.lastPayment; // change to last payment
    let frequency = payment.paymentFrequency;
    let overdue = isPaymentOverdue(currentDate, lastDate, frequency);
    if (!overdue) return { message: "Payment not overdue" };
  } else {
    if (!hasDatePassed(new Date(), payment.startDate))
      return { message: "Payment not overdue" };
  }

  let body = {
    token: client.paymentToken,
    ip: client.clientIP,
    merchantCode: "5AR0055",
    customerCode: client.customerCode,
    amount: payment.amount,
  };
  logger.log(
    "Payment attempted for: " +
      client.customerCode +
      " for amount $" +
      payment.amount
  );

  let paymentResponse = await fetch(
    "https://payments-stest.npe.auspost.zone/v2/payments",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (await getToken()),
      },
      body: JSON.stringify(body),
    }
  );
  let paymentJSON = await paymentResponse.json();
  try {
    await Client.findOneAndUpdate(
      { _id: clientID, "payments._id": client.payments[index]._id },
      {
        $push: { "payments.$.paymentHistory": paymentJSON },
        $set: { "payments.$.lastAttempted": paymentJSON.createdAt },
      }
    );
  } catch (e) {
    return;
  }
  if (paymentJSON.gatewayResponseMessage == "Transaction successful") {
    logger.log(
      client.name + " has successfully made payment of $" + payment.amount / 100
    );
    if (payment.ignoreLastPayment) {
      await Client.updateOne(
        { _id: clientID, "payments._id": client.payments[index]._id },
        { $set: { "payments.$.ignoreLastPayment": false } }
      );
    }
    await Client.updateOne(
      { _id: clientID, "payments._id": client.payments[index]._id },
      {
        $inc: {
          "payments.$.timesRecurringLeft": -1,
          "payments.$.successCount": 1,
          totalSuccess: payment.amount,
        },
        $set: { "payments.$.lastPayment": paymentJSON.createdAt },
      }
    );
    return { message: "Success" };
  } else {
    return paymentJSON;
  }
}

module.exports = router;
