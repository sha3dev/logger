/**
 * Logger
 */

/**
 * imports: externals
 */

import createDebug, { Debugger } from "debug";

/**
 * imports: internals
 */

import CONFIG from "../config";

/**
 * types
 */

export type LoggerType = "debug" | "info" | "warn" | "error";

export type PluginConfig = { name: string; options: any };

export type LoggerConfig = {
  loggerName: string | null;
  plugins?: PluginConfig[];
};

/**
 * exports
 */

export default class Logger {
  /**
   * private: attributes
   */

  private appId: string = CONFIG.APP_ID;

  private config: LoggerConfig;

  private loggersInstances: Record<LoggerType, Debugger>;

  /**
   * private: methods
   */

  private getLoggerByLevel(loggerName: string | null, level: LoggerType): Debugger {
    let logger = createDebug(this.appId);
    if (loggerName && loggerName !== this.appId) {
      logger = logger.extend(loggerName);
    }
    logger = logger.extend(level);
    logger.log = (console as any)[level].bind(console);
    return logger;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private runPlugins(loggerType: LoggerType) {
    if (this.config.plugins) {
      // TODO
    }
  }

  /**
   * constructor
   */

  constructor(loggerConfig?: LoggerConfig | string) {
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

  /**
   * public: methods
   */

  public debug(value: string) {
    this.runPlugins("debug");
    this.loggersInstances.debug(value);
  }

  public info(value: string) {
    this.runPlugins("info");
    this.loggersInstances.info(value);
  }

  public warn(value: string) {
    this.runPlugins("warn");
    this.loggersInstances.warn(value);
  }

  public error(value: string) {
    this.runPlugins("error");
    this.loggersInstances.error(value);
  }
}
