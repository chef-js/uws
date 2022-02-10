"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const mime_types_1 = require("mime-types");
const fs_1 = require("fs");
function createFileReader(folder = "") {
  // get main index
  const index = folder
    ? (0, fs_1.readFileSync)((0, path_1.join)(folder, "index.html"), {
        encoding: "utf8",
      })
    : "";
  // this is used as file reader cache
  return function fileReader(url) {
    const mime = (0, mime_types_1.lookup)(url);
    const filename = (0, path_1.join)(folder, url);
    // folder?
    if (!mime) {
      return fileReader(`${url}/index.html`.replace(/\/\//g, "/"));
    }
    if ((0, fs_1.existsSync)(filename)) {
      const body = (0, fs_1.readFileSync)(filename);
      return { mime, body, status: 200 };
    }
    return { mime, body: index, status: 301 };
  };
}
exports.default = createFileReader;
