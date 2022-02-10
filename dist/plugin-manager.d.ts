import { WSConfig, WSPlugin } from "./types.js";
export declare function populatePlugins(config: WSConfig): Promise<void>;
export declare function getPlugin(
  config: WSConfig,
  topic: string
): WSPlugin | undefined;
//# sourceMappingURL=plugin-manager.d.ts.map
