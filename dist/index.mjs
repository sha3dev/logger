// src/lib/logger.ts
import createDebug from "debug";

// src/config.ts
var ENV = process["env"];
var config_default = {
  APP_NAME: ENV.APP_NAME || "default"
};

// src/lib/logger.ts
var Logger = class {
  appName = config_default.APP_NAME;
  config;
  loggersInstances;
  getLoggerByLevel(loggerName, level) {
    let logger = createDebug(this.appName);
    if (loggerName) {
      logger = logger.extend(loggerName);
    }
    logger = logger.extend(level);
    logger.log = console[level].bind(console);
    return logger;
  }
  runPlugins(loggerType) {
    if (this.config.plugins) {
    }
  }
  constructor(loggerConfig) {
    if (!loggerConfig) {
      this.config = { loggerName: null };
    } else if (typeof loggerConfig === "string") {
      this.config = { loggerName: loggerConfig };
    } else {
      this.config = loggerConfig;
    }
    this.loggersInstances = {
      debug: this.getLoggerByLevel(this.config.loggerName, "debug"),
      info: this.getLoggerByLevel(this.config.loggerName, "info"),
      warn: this.getLoggerByLevel(this.config.loggerName, "warn"),
      error: this.getLoggerByLevel(this.config.loggerName, "error")
    };
  }
  debug(value) {
    this.runPlugins("debug");
    this.loggersInstances.debug(value);
  }
  info(value) {
    this.runPlugins("info");
    this.loggersInstances.info(value);
  }
  warn(value) {
    this.runPlugins("warn");
    this.loggersInstances.warn(value);
  }
  error(value) {
    this.runPlugins("error");
    this.loggersInstances.error(value);
  }
};

// src/index.ts
var src_default = Logger;
export {
  src_default as default
};
