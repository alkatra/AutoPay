const express = require("express");
const app = express();
const isAdmin = require("./middleware/isAdmin");

const port = 443;
const logger = require("./functions/logger");
const Logs = require("./models/log");
const https = require("https");
const fs = require("fs");
https
  .createServer(
    // Provide the private and public key to the server by reading each
    // file's content with the readFileSync() method.
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app
  )
  .listen(port, () => {
    console.log("server is runing at port " + port);
  });
const base = `${__dirname}/public`;
app.use(express.static("public"));
var User = require("./models/user");

require("dotenv").config();
const cookieParser = require("cookie-parser");
const session = require("express-session");

const mongoose = require("mongoose");
const mongoURI =
  "mongodb+srv://dbAdmin:dbAdmin@cluster0.2dme8.mongodb.net/mydb?retryWrites=true&w=majority";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: mongoURI,
  collection: "mySessions",
});
app.use(
  session({
    secret: "mysecretxxx",
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
    saveUninitialized: false,
    resave: false,
    store: store,
    cookie: { secure: true },
  })
);
var cors = require("cors");
app.use(cors({ credentials: true, origin: true }));
const isAuth = require("./middleware/isAuth");
const isNotAuth = require("./middleware/isNotAuth");
var Client = require("./models/client");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(cookieParser());
var favicon = require("serve-favicon");
app.use(favicon(`${base}/favicon.ico`));
const API = require(`./controllers/api.js`);
app.use("/api", API);
const adminAPI = require(`./controllers/admin.js`);
app.use("/admin", adminAPI);

app.get("/", isNotAuth, (req, res) => {
  res.sendFile(`${base}/login.html`);
});

app.get("/dash", isAuth, (req, res) => {
  res.sendFile(`${base}/dashboard.html`);
});

app.get("/logs", isAdmin, async (req, res) => {
  res.sendFile(`${base}/logs.html`);
});

app.get("/manylogs", isAdmin, async (req, res) => {
  res.send(await Logs.find({}).sort({ date: -1 }));
});

app.get("/paymentlogs", isAuth, async (req, res) => {
  res.sendFile(`${base}/payment-logs.html`);
});

app.get("/addclient", isAuth, (req, res) => {
  res.sendFile(`${base}/client-create.html`);
});

app.get("/payment/:id", async (req, res) => {
  try {
    var result = await Client.findOne({ _id: req.params.id });
  } catch (e) {
    logger.log(e);
    res.status(404).send({ message: "Broken link." });
    return;
  }
  if (!result) {
    res.status(404).send({ message: "User does not exist." });
  } else if (result.paymentToken == "") {
    res.sendFile(`${base}/payment.html`);
  } else {
    res.status(400).send({ message: "Payment method already exists." });
  }
});

app.get("/manage/:id", isAuth, async (req, res) => {
  try {
    var result = await Client.findOne({ _id: req.params.id });
  } catch (e) {
    logger.log(e);
    res.status(404).send({ message: "Broken link." });
    return;
  }
  if (!result) {
    res.status(404).send({ message: "User does not exist." });
    return;
  }
  try {
    let merchantID = result.merchantID;
    let userID = await getUserID(req.session.username);
    // console.log(merchantID, userID);
    if (!result) {
      res.status(404).send({ message: "User does not exist." });
    } else if (userID == merchantID) {
      res.sendFile(`${base}/manage-client.html`);
    } else {
      res.status(400).send({ message: "Access Denied." });
    }
  } catch (e) {
    logger.log(e);
    res.status(404).send(e);
  }
});

app.get("/schedule/:id", isAuth, async (req, res) => {
  try {
    var result = await Client.findOne({ _id: req.params.id });
  } catch (e) {
    logger.log(e);
    res.status(404).send({ message: "Broken link." });
    return;
  }
  try {
    if (!result) {
      res.status(404).send({ message: "User does not exist." });
      return;
    }
    let merchantID = result.merchantID;
    let userID = await getUserID(req.session.username);
    // console.log(merchantID, userID);
    if (!result) {
      res.status(404).send({ message: "User does not exist." });
    } else if (userID == merchantID) {
      res.sendFile(`${base}/schedule-create.html`);
    } else {
      res.status(400).send({ message: "Access Denied." });
    }
  } catch (e) {
    logger.log(e);
    res.status(404).send(e);
  }
});

app.get("/logout", isAuth, (req, res) => {
  try {
    req.session.destroy((e) => {
      if (e) res.status(500).send({ message: "Server Error" });
      res.status(200).redirect("/");
    });
  } catch (e) {
    logger.log(e);
    res.status(404).send(e);
  }
});

async function getUserID(username) {
  let results = await User.find({ username: username });
  return results[0]._id;
}

// app.get('*', (req,res) => {
//     res.sendFile(`${base}/404.html`);
// });
