// src/lib/logger.ts
import createDebug from "debug";
var Logger = class {
  appName = process["env"].APP_NAME || "default";
  config;
  loggersInstances;
  getLoggerByLevel(loggerName, level) {
    const logger = createDebug(this.appName).extend(loggerName).extend(level);
    logger.log = console[level].bind(console);
    return logger;
  }
  constructor(loggerConfig) {
    if (typeof loggerConfig === "string") {
      this.config = { loggerName: loggerConfig };
    } else {
      this.config = loggerConfig;
    }
    this.loggersInstances = {
      log: this.getLoggerByLevel(this.config.loggerName, "log"),
      info: this.getLoggerByLevel(this.config.loggerName, "info"),
      warn: this.getLoggerByLevel(this.config.loggerName, "warn"),
      error: this.getLoggerByLevel(this.config.loggerName, "error")
    };
  }
  debug(value) {
    this.loggersInstances.log(value);
  }
  info(value) {
    this.loggersInstances.info(value);
  }
  warn(value) {
    this.loggersInstances.warn(value);
  }
  error(value) {
    this.loggersInstances.error(value);
  }
};

// src/index.ts
var src_default = Logger;
export {
  src_default as default
};
