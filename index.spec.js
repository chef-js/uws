describe("GIVEN chef is provided", () => {
  it("THEN requiring the library does not throw an error", () => {
    require(".");
  });

  describe("WHEN it is instantiated", () => {
    it("THEN it should initialize without throwing error", () => {
      const startChef = require(".");

      expect(() =>
        startChef({ type: "uws", folder: "demo", port: 3001 })
      ).not.toThrow();
    });

    it("THEN initialization should return a truthy instance", async () => {
      const startChef = require(".");

      expect(
        await startChef({ type: "uws", folder: "demo", port: 3002 })
      ).toBeTruthy();
    });
  });

  describe("WHEN chef is initialized in ssl mode", () => {
    it("THEN it should not throw error", async () => {
      const startChef = require(".");
      const api = await startChef({
        type: "uws",
        debug: true,
        ssl: {
          key: "node_modules/chef-core/ssl/example.key",
          cert: "node_modules/chef-core/ssl/example.crt",
        },
        folder: "demo",
        port: 3010,
      });

      expect(api).toBeTruthy();
    });
  });

  describe("WHEN chef is initialized in debug mode", () => {
    it("THEN it should not throw error", async () => {
      const startChef = require(".");
      const api = await startChef({
        type: "uws",
        folder: "demo",
        debug: true,
        port: 3003,
      });

      expect(api).toBeTruthy();
    });
  });

  describe("WHEN chef is run on demo folder", () => {
    it("THEN it should not throw error", async () => {
      const startChef = require(".");
      const test = async () =>
        await startChef({
          type: "uws",
          debug: true,
          folder: "demo",
          port: 3004,
        });

      expect(test).not.toThrow();
    });
  });

  describe("WHEN chef is initialized on specified port", () => {
    it("THEN it should start without error", async () => {
      const startChef = require(".");
      const server = await startChef({
        type: "uws",
        folder: "demo",
        port: 8080,
      });

      expect(server).toBeTruthy();
    });
  });

  describe("WHEN chef is initialized with plugin", () => {
    it("THEN it should start without error", (done) => {
      const startChef = require(".");
      const config = require("chef-core/config");

      startChef({
        type: "uws",
        folder: "demo",
        port: 4200,
        plugins: {
          chat: function (ws, { id, event, data }) {
            try {
              // echo back
              ws.send(JSON.stringify({ event, id, data }));

              // emit example
              ws.send(JSON.stringify({ event: "example", id: "server" }));

              // and leave
              ws.send(JSON.stringify({ event: config.leave }));
            } catch (err) {}
          },
        },
      }).then(({ config }) => {
        const WebSocket = require("ws");
        global.window = { WebSocket };

        const UWebSocket = require("./client");
        const ws = new UWebSocket("ws://localhost:4200");

        ws.on("connect", () => {
          // after connect, join a plugin (chat) - emit "/join" event with data = "chat"
          ws.emit(config.join, "chat");
        });

        ws.on("disconnect", () => {
          // your socket got disconnected
          done();
        });

        ws.on(config.join, (id, event, data) => {
          // socket with id joined plugin, first join sets your socket's id
          ws.id = ws.id || id;

          expect(data).toBe("chat");
        });

        ws.on(config.leave, (id, event, data) => {
          // socket with id left plugin
          ws.close();
        });

        ws.on("example", example);

        ws.onAny((id, event, data) => {
          // handle all incoming messsages
          console.log({ id, event, data });
        });

        function example(id, event, data) {
          // handle event with "example" name
          expect(event).toBe("example");
          expect(data).toBe(undefined);
          expect(id).toBe("server");

          expect(ws.events.example.length).toBe(1);

          ws.off("example", example);

          expect(ws.events.example.length).toBe(0);

          ws.close();
        }
      });
    });
  });
});
