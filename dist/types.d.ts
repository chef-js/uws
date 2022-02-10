/// <reference types="node" />
export declare type WSGet = (res: any, req: any, next?: any) => any;
export declare type WSServer = {
  get: (path: string, cb: WSGet) => any;
  post: (path: string, cb: WSGet) => any;
  any: (path: string, cb: WSGet) => any;
  listen: (port: number) => any;
};
export declare type WSEvent = {
  id: string;
  event: string;
  data?: any;
};
export declare type WSPlugin = (ws: WebSocket | any, event: WSEvent) => void;
export declare type WSFileReaderResponse = {
  mime: string;
  body: string | Buffer;
  status: number;
};
export declare type WSConfig = {
  debug: boolean;
  port: number;
  plugins: {
    [plugin: string]: WSPlugin;
  };
  join: string;
  leave: string;
  folder: string;
  type: string;
};
//# sourceMappingURL=types.d.ts.map
