# chef-uws

<img style="max-width: 100%;" src="https://raw.githubusercontent.com/chef-js/express/main/chef.png" width="150" />

<a href="https://badge.fury.io/js/chef-uws"><img src="https://badge.fury.io/js/chef-uws.svg" alt="npm package version" /></a> <a href="https://circleci.com/gh/chef-js/uws"><img src="https://circleci.com/gh/chef-js/uws.svg?style=shield" alt="tests status" /></a>

**web-sockets** micro-service manager and **static files server** at the same port,

designed for **node** written in **typescript**, with **tests**

- `uWebSockets.js` for serving files and websockets

## Minimal Chat Demo

https://chef-js-uws.herokuapp.com/

```bash
$ yarn add chef-uws
$ yarn chef-uws node_modules/chef-uws/demo --plugin node_modules/chef-core/chat.js
```

## Running

```bash
$ [PORT=4200] yarn chef-uws folder [--debug] [--plugin path/to/file.js]
```

```ts
const startServer = require("chef-uws");

startServer({
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
  // ssl = undefined | { key, cert }
  ssl: undefined,
}).then((server) => {
  // server api is get, post, any
  server.any("/*", (res, req) => {
    res.end("200 OK");
  });
});
```

- `PORT=4200` - choose server port
- `folder` - folder you want to server static files from
- `--debug` - show logs
- `--plugin path/to/file.js` - path to `WSPlugin`, can use multiple times

## Install

```bash
$ yarn add chef-uws
```

## Plugins

The **plugins** are a mighty thing, think of them like **chat rooms**,

after a client **handshakes** the chat room, his messages start being **forwarded** to that room,

and it is being handled there by the **room's own plugin**.

This means you can have for example: a **chat** server and other unrelated **websocket services**

at the **same port** as the **files server** too. **One** client may be in **many** rooms.

### STEP 1: Before Connection

- client -> `websocket` connects to `location.origin.replace(/^http/, 'ws')`
- server -> waits for any incoming `config.join` events

### STEP 2: Connection

- client -> sends `join` event with room name (topic/plugin name)
- server -> if such plugin is configured joins client to that plugin

### STEP 3: After Connection

- client -> does some actions (emits, receives)
- server -> plugin responds to websocket actions

### STEP 4: Finish Connection

- client -> disconnects after some time
- server -> broadcasts to all plugins from room that client left (`config.leave`)

## API

- a plugin is a function `(ws, { id, event, data })` that is called **each time** the frontend websocket emits to server
- context (`this`) of each plugin is the `server` instance.
- plugins receive (and send) the data in the format of:

```ts
{
  id,    // WebSocket id - this is automatically added
  event, // event name as string
  data,  // any data accompanying the event
}
```

## License

MIT
