import uWebSockets from "uWebSockets.js";
import Cache from "chef-core/dist/cache";
import { WSConfig, WSServer } from "chef-core/dist/types";
export declare function createServer(config: WSConfig): Promise<WSServer>;
export declare function requestHandler(
  fileReaderCache: Cache
): (res: uWebSockets.HttpResponse, req: uWebSockets.HttpRequest) => void;
//# sourceMappingURL=index.d.ts.map
