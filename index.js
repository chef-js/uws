const { default: startServer } = require("./dist");

module.exports = async function start() {
  return await startServer({
    type: "uws",
  });
};
