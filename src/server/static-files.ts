import { join } from "path";
import { lookup } from "mime-types";
import { existsSync, readFileSync } from "fs";
import { WSFileReaderResponse } from "../types";

export default function createFileReader(
  folder: string = ""
): (url: string) => WSFileReaderResponse {
  // get main index
  const index: string | null = folder
    ? readFileSync(join(folder, "index.html"), { encoding: "utf8" })
    : "";

  // this is used as file reader cache
  return function fileReader(url: string): WSFileReaderResponse {
    const mime: string | false = lookup(url);
    const filename: string = join(folder, url);

    // folder?
    if (!mime) {
      return fileReader(`${url}/index.html`.replace(/\/\//g, "/"));
    }

    if (existsSync(filename)) {
      const body = readFileSync(filename);

      return { mime, body, status: 200 };
    }

    return { mime, body: index, status: 301 };
  };
}
