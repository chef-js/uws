const { startServer } = require("@jacekpietal/bouncer.js");

module.exports = async function start() {
  return await startServer({
    type: "uws",
  });
};
