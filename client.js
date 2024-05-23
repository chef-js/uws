const { WebSocket } = window;

/**
 * microwebsocket - socket.io-like extension to websocket, use on front
 * @typedef {UWebSocket | SocketIOClient} UWebSocket
 */
class UWebSocket {
  /**
   * @param {string} serverUrl
   * @returns {WebSocket | SocketIOClient}
   */
  constructor(serverUrl = window.location.origin.replace(/^http/, "ws")) {
    this.allKey = "*";
    this.events = {
      [this.allKey]: [],
    };

    this.ws = new WebSocket(serverUrl);
    this.ws.onmessage = ({ data: socketMessage }) => {
      const message =
        typeof socketMessage === "string"
          ? JSON.parse(socketMessage)
          : socketMessage;
      const { id: socketId, event, data } = message;

      const id = socketId || this.ws.id;
      const callbacks = this.events[event];

      if (callbacks) {
        callbacks.forEach((callback) =>
          callback.call(this.ws, id, event, data),
        );
      }

      this.events[this.allKey].forEach((callback) =>
        callback.call(this.ws, id, event, data),
      );
    };

    Object.freeze(this.ws.onmessage);
  }

  /**
   * Sets ws id
   * @param {string|number} id
   */
  set id(id) {
    this.ws.id = id;
  }

  /**
   * Gets ws id
   */
  get id() {
    return this.ws.id;
  }

  /**
   * Sets onopen ws callback
   * @param {function} callback
   */
  set onopen(callback) {
    return this.on("connect", callback);
  }

  /**
   * Sets onclose ws callback
   * @param {function} callback
   */
  set onclose(callback) {
    return this.on("disconnect", callback);
  }

  /**
   * Sets onerror ws callback
   * @param {function} callback
   */
  set onerror(callback) {
    this.ws.onerror = callback;
  }

  /**
   * Adds on any message ws callback
   * @param {function} callback
   */
  set onmessage(callback) {
    return this.onAny(callback);
  }

  /**
   * Calls onclose on ws
   */
  close() {
    this.ws.close();
  }

  /**
   * onAny((id, event, data) => {})
   * @param {function} callback
   */
  onAny(callback) {
    return this.on(this.allKey, callback);
  }

  /**
   * on("event", (id, event, data) => {})
   * @param {string} event
   * @param {function} callback
   */
  on(name, callback) {
    switch (name) {
      case "connect":
        this.ws.onopen = callback.bind(this.ws);
        break;

      case "disconnect":
        this.ws.onclose = callback.bind(this.ws);
        break;

      case this.allKey:
        this.events[this.allKey].push(callback);
        break;

      default:
        if (!this.events[name]) {
          this.events[name] = [];
        }

        this.events[name].push(callback);
        break;
    }
  }

  /**
   * remove callback on event
   * @param {string} event
   * @param {function} callback
   * @returns {boolean}
   */
  off(event, callback) {
    const events = this.events[event];

    if (!events) {
      return false;
    }

    const index = events.indexOf(callback);

    if (index !== -1) {
      events.splice(index, 1);

      return true;
    }

    return false;
  }

  /**
   * @param {string} event
   * @param {any} data
   */
  emit(event, data) {
    this.send({ id: this.id, event, data });
  }

  /**
   * Sends string from ws
   * @param {object|string} objectOrString
   */
  send(objectOrString) {
    const value =
      typeof objectOrString === "string"
        ? objectOrString
        : JSON.stringify(objectOrString);

    this.ws.send(value);
  }
}

if (typeof window !== "undefined") {
  window["UWebSocket"] = UWebSocket;
}

if (typeof module !== "undefined") {
  module.exports = UWebSocket;
}
