import Cache from "chef-core/dist/cache";
import { WSConfig, WSServer } from "chef-core/dist/types";
export declare function createServer(config: WSConfig): Promise<WSServer>;
export declare function requestHandler(
  fileReaderCache: Cache
): (res: any, req: any) => void;
//# sourceMappingURL=index.d.ts.map
