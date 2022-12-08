const Log = require("../models/log");
module.exports.log = async function (message) {
  let log = new Log();
  log.message = message;
  log.date = new Date();
  await log.save();
  return;
};
