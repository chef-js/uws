import uWebSockets from "uWebSockets.js";
import { Cache } from "latermom";
import { WSConfig, WSFileReaderResponse, WSServer } from "chef-core/dist/types";
export declare function createServer(config: WSConfig): Promise<WSServer>;
export declare function requestHandler(
  fileReaderCache: Cache<WSFileReaderResponse>
): (res: uWebSockets.HttpResponse, req: uWebSockets.HttpRequest) => void;
//# sourceMappingURL=index.d.ts.map
