export type WSGet = (res: any, req: any, next?: any) => any;

export type WSServer = {
  get: (path: string, cb: WSGet) => any;
  post: (path: string, cb: WSGet) => any;
  any: (path: string, cb: WSGet) => any;
  listen: (port: number) => any;
};

export type WSEvent = {
  id: string;
  event: string;
  data?: any;
};

export type WSPlugin = (ws: WebSocket | any, event: WSEvent) => void;

export type WSFileReaderResponse = {
  mime: string;
  body: string | Buffer;
  status: number;
};

export type WSConfig = {
  debug: boolean;
  port: number;
  plugins: { [plugin: string]: WSPlugin };
  join: string;
  leave: string;
  folder: string;
  type: string;
};
