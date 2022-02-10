"use strict";

describe("GIVEN chef is provided", () => {
  it("THEN requiring the library does not throw an error", () => {
    require(".");
  });

  describe("WHEN it is instantiated", () => {
    it("THEN it should initialize without throwing error", () => {
      const { default: startChef } = require("./dist");

      expect(() =>
        startChef({ type: "uws", folder: "demo", port: 3001 })
      ).not.toThrow();
    });

    it("THEN initialization should return a truthy instance", async () => {
      const { default: startChef } = require("./dist");

      expect(
        await startChef({ type: "uws", folder: "demo", port: 3002 })
      ).toBeTruthy();
    });
  });

  describe("WHEN chef is initialized in debug mode", () => {
    it("THEN it should not throw error", async () => {
      const { default: startChef } = require("./dist");
      const api = await startChef({
        folder: "demo",
        debug: true,
        port: 3003,
      });

      expect(api).toBeTruthy();
    });
  });

  describe("WHEN chef.serve is run on demo folder", () => {
    it("THEN it should not throw error", async () => {
      const { default: startChef } = require("./dist");
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
      const { default: startChef } = require("./dist");
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
      const { default: startChef } = require("./dist");
      const { default: config } = require("chef-core/dist/config");

      startChef({
        folder: "demo",
        port: 4200,
        plugins: {
          chat: function () {
            done();
          },
        },
      }).then(() => {
        const WebSocket = require("ws");
        const socket = new WebSocket("ws://localhost:4200", {
          protocol: "websockets",
        });

        socket.onmessage = ({ data: message }) => {
          const { id, event, data } = JSON.parse(message);

          expect(data).toBeTruthy();
          expect(id).toBeTruthy();
          expect(event).toBe(config.join);

          socket.close();
        };

        socket.onopen = () => {
          socket.send(JSON.stringify({ event: config.join, data: "chat" }));
        };
      });
    });
  });
});
