import {
  Config,
  Event,
  FileReaderResponse,
  Plugin,
  Server,
  ServerContext,
  getPlugin,
  getUrl,
} from "chef-core";
import { debug, folder } from "chef-core/config";

import { Cache } from "@pietal.dev/cache";
import uWebSockets from "uWebSockets.js";

const topicsMap: Map<string, string[]> = new Map();

export async function createServer(config: Config): Promise<Server> {
  const server: Partial<Server> = createUServer(config);

  // common `this.to(topic).emit(event, id, data)` api
  const api: ServerContext = {
    to: (topic: string) => ({
      emit: (event: string, id: string, data?: any) => {
        server.publish(topic, JSON.stringify({ event, id, data }));
      },
    }),
  };

  if (Object.keys(config.plugins).length) {
    server.ws("/*", {
      close(
        ws: uWebSockets.WebSocket<{}> & { id: string },
        _code: number,
        _message: ArrayBuffer | string,
      ) {
        const topics: string[] = topicsMap.get(ws.id) || [];

        topics.forEach((topic: string) => {
          const leaveEvent: Event = {
            event: config.leave,
            id: ws.id,
            data: topic,
          };

          if (config.debug) {
            console.info(leaveEvent);
          }

          // handle leave event in plugins
          const plugin: Plugin | undefined = getPlugin(config, topic);

          plugin?.call(api, ws, leaveEvent);
        });

        topicsMap.delete(ws.id);
      },
      message: (
        ws: uWebSockets.WebSocket<{}> & { id: string },
        message: ArrayBuffer | string,
        _isBinary: boolean,
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
          const plugin: Plugin | undefined = getPlugin(config, topic);

          if (plugin) {
            const topics: string[] = [...(topicsMap.get(ws.id) || []), topic];

            topicsMap.set(ws.id, topics);

            ws.subscribe(topic);
          }
        }

        ws.getTopics().forEach((topic: string) => {
          const plugin: Plugin | undefined = getPlugin(config, topic);

          plugin?.call(api, ws, { event, id: id || ws.id, data });
        });
      },
    });
  }

  server.start = function (port: number) {
    return new Promise((resolve) => {
      // ensure port is number
      server.listen(+port, resolve);
    });
  };

  return server as Server;
}

function createUServer(config: Partial<Config> = {}): uWebSockets.TemplatedApp {
  // spread ssl from config
  const { ssl } = config;

  // if config key and cert present
  if (ssl?.key && ssl?.cert) {
    // start ssl app and finish
    return uWebSockets.SSLApp({
      // change ssl params format to uWebSockets compatible
      key_file_name: ssl.key,
      cert_file_name: ssl.cert,
    });
  }

  // else start normal app
  return uWebSockets.App();
}

function getMessage(message: ArrayBuffer | string): string {
  return typeof message === "string"
    ? message
    : Buffer.from(message).toString();
}

export function requestHandler(fileReaderCache: Cache<FileReaderResponse>) {
  return (
    res: uWebSockets.HttpResponse,
    req: uWebSockets.HttpRequest,
    next?: () => void,
  ) => {
    const url: string = getUrl(req.getUrl());
    if (!url.match(new RegExp(`/${folder}/`))) {
      next?.();

      return false;
    }

    const { status, mime, body } = fileReaderCache.get(url);
    if (debug) {
      console.info(status, mime, url);
    }

    // set content type by write header
    res.writeHeader("Content-Type", mime);
    // string status
    res.writeStatus(status.toString());

    res.end(body);
    return true;
  };
}
