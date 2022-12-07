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

export type LoggerType = "log" | "info" | "warn" | "error";

export type LoggerConfig = { loggerName: string };

/**
 * exports
 */

export default class Logger {
  /**
   * private: attributes
   */

  private appName: string = CONFIG.APP_NAME;

  private config: LoggerConfig;

  private loggersInstances: Record<LoggerType, Debugger>;

  /**
   * private: methods
   */

  private getLoggerByLevel(loggerName: string, level: LoggerType): Debugger {
    const logger = createDebug(this.appName).extend(loggerName).extend(level);
    logger.log = (console as any)[level].bind(console);
    return logger;
  }

  /**
   * constructor
   */

  constructor(loggerConfig: LoggerConfig | string) {
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

  /**
   * public: methods
   */

  public debug(value: string) {
    this.loggersInstances.log(value);
  }

  public info(value: string) {
    this.loggersInstances.info(value);
  }

  public warn(value: string) {
    this.loggersInstances.warn(value);
  }

  public error(value: string) {
    this.loggersInstances.error(value);
  }
}
