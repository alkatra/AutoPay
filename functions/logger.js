const Log = require("../models/log");
exports.log = async function log(message) {
  let log = new Log();
  log.message = message;
  log.date = new Date();
  await log.save();
  return;
};
