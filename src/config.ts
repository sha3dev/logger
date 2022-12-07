// https://vitejs.dev/guide/env-and-mode.html#env-variables
// eslint-disable-next-line @typescript-eslint/dot-notation
const ENV = process["env"];

export default {
  APP_NAME: ENV.PUPPETEER_LAUNCH_ARGS || "default"
};
