"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.startServer = void 0;
const index_js_1 = __importDefault(require("./server/index.js"));
const config_js_1 = __importDefault(require("./config.js"));
// dynamically start server
async function startServer(userConfig = {}) {
  // merge configurations
  const config = { ...config_js_1.default, ...userConfig };
  // dynamically create wrapped compatible express or uws server
  const server = await (0, index_js_1.default)(config);
  // mandatory started message
  console.info(`Started ${config.type} app on port`, config.port);
  if (Object.keys(config.plugins).length) {
    console.info("with plugin(s)", Object.keys(config.plugins).join(", "));
  }
  // resolve with server
  return server;
}
exports.startServer = startServer;
// some useful types
__exportStar(require("./types.js"), exports);
// base configuration
exports.config = config_js_1.default;
