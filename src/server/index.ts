import uWebSockets from "uWebSockets.js";
import Cache from "chef-core/dist/cache";
import config from "chef-core/dist/config";
import getUrl from "chef-core/dist/server/get-url";
import { getPlugin } from "chef-core/dist/plugins";
import {
  WSConfig,
  WSEvent,
  WSGet,
  WSPlugin,
  WSServer,
} from "chef-core/dist/types";

const topicsMap: Map<string, string[]> = new Map();

export async function createServer(config: WSConfig): Promise<WSServer> {
  const server: any = createUWSServer(config);

  // forwarding api
  const api: object = {
    to: (topic: string) => ({
      emit: (event: string, id: string, data: any) => {
        server.publish(topic, JSON.stringify({ event, id, data }));
      },
    }),
  };

  if (Object.keys(config.plugins).length) {
    server.ws("/*", {
      close(
        ws: uWebSockets.WebSocket,
        _code: number,
        _message: ArrayBuffer | string
      ) {
        const topics: string[] = topicsMap.get(ws.id) || [];

        topics.forEach((topic: string) => {
          const leaveEvent: WSEvent = {
            event: config.leave,
            id: ws.id,
            data: topic,
          };

          if (config.debug) {
            console.info(leaveEvent);
          }

          // handle leave event in plugins
          const plugin: WSPlugin | undefined = getPlugin(config, topic);

          plugin?.call(api, ws, leaveEvent);
        });
      },
      message: (
        ws: uWebSockets.WebSocket,
        message: ArrayBuffer | string,
        _isBinary: boolean
      ) => {
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
          const topic: string = data;
          const plugin: WSPlugin | undefined = getPlugin(config, topic);

          if (plugin) {
            const topics: string[] = [...(topicsMap.get(ws.id) || []), topic];

            topicsMap.set(ws.id, topics);

            ws.subscribe(topic);
          }
        }

        ws.getTopics().forEach((topic: string) => {
          const plugin: WSPlugin | undefined = getPlugin(config, topic);

          plugin?.call(api, ws, { event, id: id || ws.id, data });
        });
      },
    });
  }

  // WSGet compatible, this = method: string
  function createReader(path: string, wsGet: WSGet): void {
    const action = server[this.toLowerCase()];

    if (action) {
      action.call(
        server,
        path,
        (
          res: uWebSockets.HttpResponse,
          req: uWebSockets.HttpRequest,
          next: any
        ) => wsGet(res, req, next)
      );
    }
  }

  return {
    async listen(port: number): Promise<any> {
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

function createUWSServer(config: any = {}): any {
  // spread ssl from config
  const { ssl, ...appOptions } = config;

  // if config key and cert present
  if (ssl?.key && ssl?.cert) {
    // start ssl app and finish
    return uWebSockets.SSLApp({
      // change ssl params format to uWebSockets compatible
      key_file_name: ssl.key,
      cert_file_name: ssl.cert,
      // rest of app options
      ...appOptions,
    });
  }

  // else start normal app
  return uWebSockets.App(appOptions);
}

function getMessage(message: ArrayBuffer | string): string {
  return typeof message === "string"
    ? message
    : Buffer.from(message).toString();
}

export function requestHandler(fileReaderCache: Cache) {
  return (res: any, req: any) => {
    const url: string = getUrl(req.getUrl());
    const { status, mime, body } = fileReaderCache.get(url);

    if (config.debug) {
      console.info(status, mime, url);
    }

    // set content type by write header
    res.writeHeader("Content-Type", mime);
    // string status
    res.writeStatus(status.toString());

    res.end(body);
  };
}
