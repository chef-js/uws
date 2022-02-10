"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
  // this enables http/ws logs
  debug: process.argv.includes("--debug"),
  // port on which the server listens
  port: Number(process.env.PORT || 4200),
  // you can use --plugin ./path/to/plugin.js any number of times
  plugins: {},
  // handshake event
  join: "/join",
  // disconnect from room event
  leave: "/leave",
  // folder to static server files
  folder: process.argv[2],
  // type of server started
  type: process.argv.includes("--uws") ? "uws" : "express",
};
exports.default = config;
