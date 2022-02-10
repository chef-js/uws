"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const uWebSockets_js_1 = __importDefault(require("uWebSockets.js"));
const plugin_manager_js_1 = require("../plugin-manager.js");
const topicsMap = new Map();
async function createWrappedServer(config = {}) {
  const server = createServer(config);
  // forwarding api
  const api = {
    to: (topic) => ({
      emit: (event, id, data) => {
        server.publish(topic, JSON.stringify({ event, id, data }));
      },
    }),
  };
  if (Object.keys(config.plugins).length) {
    server.ws("/*", {
      close(ws, _code, _message) {
        const topics = topicsMap.get(ws.id) || [];
        topics.forEach((topic) => {
          const leaveEvent = {
            event: config.leave,
            id: ws.id,
            data: topic,
          };
          if (config.debug) {
            console.info(leaveEvent);
          }
          // handle leave event in plugins
          const plugin = (0, plugin_manager_js_1.getPlugin)(config, topic);
          plugin?.call(api, ws, leaveEvent);
        });
      },
      message: (ws, message, _isBinary) => {
        // microwebsockets dont have default ids
        if (!ws.id) {
          ws.id = Math.random().toString(36).substr(2).toUpperCase();
        }
        const { id, event, data } = JSON.parse(getMessage(message));
        if (config.debug) {
          console.info({ event, id: id || ws.id, data });
        }
        // handle join
        if (event === config.join) {
          const topic = data;
          const plugin = (0, plugin_manager_js_1.getPlugin)(config, topic);
          if (plugin) {
            const topics = [...(topicsMap.get(ws.id) || []), topic];
            topicsMap.set(ws.id, topics);
            ws.subscribe(topic);
          }
        }
        ws.getTopics().forEach((topic) => {
          const plugin = (0, plugin_manager_js_1.getPlugin)(config, topic);
          plugin?.call(api, ws, { event, id: id || ws.id, data });
        });
      },
    });
  }
  // WSGet compatible, this = method: string
  function createReader(path, wsGet) {
    const action = server[this.toLowerCase()];
    if (action) {
      action.call(server, path, (res, req, next) => wsGet(res, req, next));
    }
  }
  return {
    async listen(port) {
      return new Promise((resolve) => {
        // ensure port is number
        server.listen(+port, resolve);
      });
    },
    get: createReader.bind("GET"),
    post: createReader.bind("POST"),
    any: createReader.bind("ANY"),
  };
}
exports.default = createWrappedServer;
function createServer(config = {}) {
  // spread ssl from config
  const { ssl, ...appOptions } = config;
  // if config key and cert present
  if (ssl?.key && ssl?.cert) {
    // start ssl app and finish
    return uWebSockets_js_1.default.SSLApp({
      // change ssl params format to uWebSockets compatible
      key_file_name: ssl.key,
      cert_file_name: ssl.cert,
      // rest of app options
      ...appOptions,
    });
  }
  // else start normal app
  return uWebSockets_js_1.default.App(appOptions);
}
function getMessage(message) {
  return typeof message === "string"
    ? message
    : Buffer.from(message).toString();
}
