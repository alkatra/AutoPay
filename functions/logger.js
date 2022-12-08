const Log = require("../models/log");

module.export = async function log(message) {
  let log = new Log();
  log.message = message;
  log.date = new Date();
  await log.save();
  return;
};
