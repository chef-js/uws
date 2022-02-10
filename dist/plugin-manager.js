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
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlugin = exports.populatePlugins = void 0;
const path_1 = require("path");
async function populatePlugins(config) {
  // get plugins from bash regex
  const matches = process.argv.join(" ").match(/--plugin [^ ]+/);
  if (matches) {
    // we need to get our promises in order
    const syncMap = matches.map((path) => {
      const [_, plugin] = path.split(" ");
      return Promise.resolve().then(() =>
        __importStar(require((0, path_1.resolve)(plugin)))
      );
    });
    // so the main function awaits properly
    const plugins = await Promise.all(syncMap);
    plugins.forEach(({ default: plugin }) => {
      // populate plugins
      config.plugins[plugin.name] = plugin;
    });
  }
}
exports.populatePlugins = populatePlugins;
function getPlugin(config, topic) {
  // check if we have such plugin
  return config.plugins[topic];
}
exports.getPlugin = getPlugin;
