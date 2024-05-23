import uWebSockets from "uWebSockets.js";
import { Cache } from "@pietal.dev/cache";
import { Config, Server, FileReaderResponse } from "chef-core";
export declare function createServer(config: Config): Promise<Server>;
export declare function requestHandler(
  fileReaderCache: Cache<FileReaderResponse>,
): (res: uWebSockets.HttpResponse, req: uWebSockets.HttpRequest) => void;
//# sourceMappingURL=index.d.ts.map
