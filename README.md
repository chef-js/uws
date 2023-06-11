# chef-uws

<img style="max-width: 100%; float: right;" src="https://raw.githubusercontent.com/chef-js/core/main/chef.svg" alt="kisscc0" width="200" height="200" />

<a href="https://badge.fury.io/js/chef-uws"><img src="https://badge.fury.io/js/chef-uws.svg" alt="npm package version" /></a> <a href="https://circleci.com/gh/chef-js/uws"><img src="https://circleci.com/gh/chef-js/uws.svg?style=shield" alt="tests status" /></a>

**web-sockets** micro-service manager and **static files server** at the same port,

designed for **node** written in **typescript**, with **tests**

- `uWebSockets.js` for serving files and websockets

## Command-Line Running

```bash
$ npx chef-uws folder [--debug] [--ssl] [--port 443] [--plugin path/to/plugin.js]
```

## Installation

```bash
$ yarn add chef-uws
```

## Minimal Chat Demo

https://chef-js-uws.herokuapp.com/

```bash
$ yarn add chef-uws
$ yarn chef-uws node_modules/chef-uws/demo --plugin node_modules/chef-core/chat.js
```

Minimal configuration is specifying folder, then it serves it from http://localhost:4200

```ts
const startServer = require("chef-uws");
const config = { folder: "docs" };

startServer(config).then((server: uWS.App | uWS.SSLApp) => {
  // server api is get, post, any
  server.any("/*", (res: uWS.HttpResponse, req: uWS.HttpRequest) => {
    res.end("200 OK");
  });
});
```

## Configuration

For more information about config parameters read:

- The default configuration https://github.com/chef-js/core#configuration

- The parameters types https://chef-js.github.io/core/types/Config.html

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

## Client

front-end **websocket client** for `uWebSockets.js` with same API as `socket.io-client`:

```html
<script src="https://unpkg.com/chef-uws@latest/client.js"></script>
```

you can use it like this:

```ts
const UWebSocket = require("chef-uws/client");
// will connect to ws:// or wss:// protocol depending on ssl enabled or not
const ws = new UWebSocket(location.origin.replace(/^http/, "ws"));

ws.on("connect", () => {
  // after connect, join a plugin (chat) - emit "/join" event with data = "chat"
  ws.emit("/join", "chat");
});
ws.on("disconnect", () => {
  // your socket got disconnected
});
ws.on("/join", (id, event, data) => {
  // socket with id joined plugin, first join sets your socket's id
  ws.id = ws.id || id;
});
ws.on("/leave", (id, event, data) => {
  // socket with id left plugin
});
ws.on("example", (id, event, data) => {
  // handle event with "example" name
});
ws.onAny((id, event, data) => {
  // handle all incoming messsages
});
```

## License

MIT
