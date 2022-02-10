import startWrappedServer from "./server/index.js";
import baseConfig from "./config.js";
import { WSConfig, WSServer } from "./types.js";

// dynamically start server
export async function startServer(userConfig: any = {}): Promise<WSServer> {
  // merge configurations
  const config: WSConfig = { ...baseConfig, ...userConfig };
  // dynamically create wrapped compatible express or uws server
  const server: WSServer = await startWrappedServer(config);
  // mandatory started message
  console.info(`Started ${config.type} app on port`, config.port);

  if (Object.keys(config.plugins).length) {
    console.info("with plugin(s)", Object.keys(config.plugins).join(", "));
  }

  // resolve with server
  return server;
}

// some useful types
export * from "./types.js";

// base configuration
export const config = baseConfig;
