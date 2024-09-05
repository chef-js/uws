"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = startChef;
const chef_core_1 = require("chef-core");
const server_1 = require("./server");
async function startChef(config) {
  return await (0, chef_core_1.chef)(
    { ...config, type: "uws" },
    {
      createServer: server_1.createServer,
      requestHandler: server_1.requestHandler,
    },
  );
}
