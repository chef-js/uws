import Cache from "../cache";
import createServer from "./microwebsockets";
import createFileReader from "./static-files.js";
import { WSConfig, WSServer } from "../types.js";
import baseConfig from "../config.js";
import { populatePlugins } from "../plugin-manager";

export default async function startServer(
  userConfig: any = {}
): Promise<WSServer> {
  const config: WSConfig = { ...baseConfig, ...userConfig };

  populatePlugins(config);

  // create the express or uws server inside a wrapper
  const server: any = await createServer(config);

  // create the static files reader based on folder
  const fileReader: (url: string) => any = createFileReader(config.folder);

  // and create a cache for above
  const fileReaderCache: { get: (url: string) => any } = new Cache(fileReader);

  // everything goes to the reader
  server.get("/*", (res: any, req: any, next?: any) => {
    const url: string = getUrl(req.originalUrl);
    const { status, mime, body } = fileReaderCache.get(url);

    if (config.debug) {
      console.info(status, mime, url);
    }

    // header sets content type
    res.header("Content-Type", mime);
    // write header sets status
    res.writeHeader(status);

    res.end(body);
  });

  // finally start the server on process.env.PORT || 4200
  await server.listen(config.port);

  return server;
}

function getUrl(url: string): string {
  return decodeURIComponent(
    url.replace(/^\/+/, "").split("?")[0].split("#")[0]
  );
}
