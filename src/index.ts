import chef from "chef-core";
import { WSConfig } from "chef-core/dist/types";
import { createServer, requestHandler } from "./server";

export default async function startChef(userConfig?: Partial<WSConfig>) {
  return await chef(
    { ...userConfig, type: "uws" },
    { createServer, requestHandler }
  );
}
