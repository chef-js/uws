const { default: startServer } = require("./dist");

module.exports = async function start(userConfig = {}) {
  return await startServer({
    ...userConfig,
    type: "uws",
  });
};
