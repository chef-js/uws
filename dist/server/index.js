"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = __importDefault(require("../cache"));
const microwebsockets_1 = __importDefault(require("./microwebsockets"));
const static_files_js_1 = __importDefault(require("./static-files.js"));
const config_js_1 = __importDefault(require("../config.js"));
const plugin_manager_1 = require("../plugin-manager");
async function startServer(userConfig = {}) {
  const config = { ...config_js_1.default, ...userConfig };
  await (0, plugin_manager_1.populatePlugins)(config);
  // create the express or uws server inside a wrapper
  const server = await (0, microwebsockets_1.default)(config);
  // create the static files reader based on folder
  const fileReader = (0, static_files_js_1.default)(config.folder);
  // and create a cache for above
  const fileReaderCache = new cache_1.default(fileReader);
  // everything goes to the reader
  server.get("/*", (res, req, next) => {
    const url = getUrl(req.getUrl());
    const { status, mime, body } = fileReaderCache.get(url);
    if (config.debug) {
      console.info(status, mime, url);
    }
    // set content type by write header
    res.writeHeader("Content-Type", mime);
    // string status
    res.writeStatus(status.toString());
    res.end(body);
  });
  // finally start the server on process.env.PORT || 4200
  await server.listen(config.port);
  return server;
}
exports.default = startServer;
function getUrl(url) {
  return decodeURIComponent(
    url.replace(/^\/+/, "").split("?")[0].split("#")[0]
  );
}
