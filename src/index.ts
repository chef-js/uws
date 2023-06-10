import { chef, WSConfig } from "chef-core";
import { createServer, requestHandler } from "./server";

export default async function startChef(config?: Partial<WSConfig>) {
  return await chef(
    { ...config, type: "uws" },
    { createServer, requestHandler }
  );
}
