import { resolve } from "path";
import { WSConfig, WSPlugin } from "./types.js";

export async function populatePlugins(config: WSConfig): Promise<void> {
  // get plugins from bash regex
  const matches: RegExpMatchArray | null = process.argv
    .join(" ")
    .match(/--plugin [^ ]+/);

  if (matches) {
    // we need to get our promises in order
    const syncMap: Promise<any>[] = matches.map((path: string) => {
      const [_, plugin] = path.split(" ");

      return import(resolve(plugin));
    });

    // so the main function awaits properly
    const plugins: { default: WSPlugin }[] = await Promise.all(syncMap);

    plugins.forEach(({ default: plugin }: { default: WSPlugin }) => {
      // populate plugins
      config.plugins[plugin.name] = plugin;
    });
  }
}

export function getPlugin(
  config: WSConfig,
  topic: string
): WSPlugin | undefined {
  // check if we have such plugin
  return config.plugins[topic];
}
