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
  constructor(serverUrl) {
    this.allKey = "*";
    this.events = {
      [this.allKey]: [],
    };

    this.ws = new WebSocket(serverUrl);
    this.ws.onmessage = (message) => {
      this.uwsOnMessage(message);
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
    this.ws.onopen = callback;
  }

  /**
   * Sets onclose ws callback
   * @param {function} callback
   */
  set onclose(callback) {
    this.ws.onclose = callback;
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
    this.on(this.allKey, callback);
  }

  /**
   * Calls onclose on ws
   */
  close() {
    this.ws.close();
  }

  /**
   * Internal function for on("...", () => {}) callback
   * @param {object} data
   */
  uwsOnMessage({ data: message }) {
    const { id, event, data } =
      typeof message === "string" ? JSON.parse(message) : message;

    const events = [
      ...(this.events[event] || []),
      ...(this.events[this.allKey] || []),
    ];

    events.forEach((action) => action({ id: id || this.ws.id, event, data }));
  }

  /**
   * Adds one SocketIOLike.on("...", () => {}) callback
   * @param {string} target
   * @param {function} callback
   */
  on(name, callback) {
    const done = ({ id, event, data }) => {
      if ([event, this.allKey].includes(name)) {
        callback({ id, event, data });
      }
    };

    this.events[name] = this.events[name] || [];
    this.events[name].push(done);
  }

  /**
   * Emits socket.io like object from ws
   * @param {object|string} objectOrString
   */
  emit(objectOrString) {
    this.send(
      typeof objectOrString === "string"
        ? objectOrString
        : JSON.stringify(objectOrString)
    );
  }

  /**
   * @param {string} event
   * @param {any} data
   */
  emitEvent(event, data) {
    this.emit({ event, data, id: this.id });
  }

  /**
   * Sends string from ws
   * @param {string} string
   */
  send(string) {
    this.ws.send(string);
  }
}

window["UWebSocket"] = UWebSocket;
