const isDev = globalThis.__INJECTED__.dev === "true";
const port = globalThis.__INJECTED__.server_port;
const DEV_PORT = 1450;
const serverPort = isDev ? DEV_PORT : Number.parseInt(port, 10);

export const API_BASE = `http://localhost:${serverPort}`;
