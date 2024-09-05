import { Config, FileReaderResponse, Server } from "chef-core";
import { Cache } from "@pietal.dev/cache";
import uWebSockets from "uWebSockets.js";
export declare function createServer(config: Config): Promise<Server>;
export declare function requestHandler(
  fileReaderCache: Cache<FileReaderResponse>,
): (
  res: uWebSockets.HttpResponse,
  req: uWebSockets.HttpRequest,
  next?: () => void,
) => boolean;
//# sourceMappingURL=index.d.ts.map
