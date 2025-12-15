/**
 * Logger
 */

/**
 * imports: externals
 */

import chalk from "chalk";
import createDebug, { Debugger } from "debug";

/**
 * imports: internals
 */

import CONFIG from "../config";

/**
 * types
 */

export type LoggerType = "debug" | "info" | "warn" | "error";;

export type LogColor = (typeof chalk)["Color"];

export type LoggerPluginConfig = { name: string; options: any };

export type LogOptions = { color?: LogColor };

export type LoggerConfig = { loggerName: string | null; plugins?: LoggerPluginConfig[] };

/**
 * exports
 */

export default class Logger {
  /**
   * private: attributes
   */

  private baseLoggerName: string = CONFIG.BASE_LOGGER_NAME;

  private config: LoggerConfig;

  private loggersInstances: Record<LoggerType, Debugger>;

  private readonly defaultColorizers: Record<LoggerType, (text: string) => string> = {
    debug: chalk.gray,
    info: chalk.blue,
    warn: chalk.yellow,
    error: chalk.red,
  };

  /**
   * private: methods
   */

  private getLoggerByLevel(
loggerName: string | null,
    level: LoggerType
  ): Debugger {
    let logger = createDebug(this.baseLoggerName);
    if (loggerName && loggerName !== this.baseLoggerName) {
      logger = logger.extend(loggerName);
    }
    logger = logger.extend(level);
    logger.log = console[level].bind(console);
    return logger;
  }

  private runPlugins(loggerType: LoggerType) {
    if (this.config.plugins) {
      // TODO
    }
  }

  private formatValue(value: string, options?: LogOptions, loggerType?: LoggerType): string {
    const optionColor = options?.color;
    if (!optionColor) {
      const formatter = loggerType ? this.defaultColorizers[loggerType] : null;
      return formatter ? formatter(value) : value;
    }
    const color = optionColor.trim() as typeof optionColor;
    if (!color) {
      return value;
    }
    try {
      const chalkMap = chalk as unknown as Record<LogColor, unknown>;
      const colorFn = chalkMap[color];
      if (typeof colorFn === "function") {
        return (colorFn as (text: string) => string)(value);
      }
      return chalk.keyword(color)(value);
    } catch {
      return value;
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
      error: this.getLoggerByLevel(this.config.loggerName, "error"),
    };
  }

  /**
   * public: methods
   */

  public debug(value: string, options?: LogOptions) {
    this.runPlugins("debug");
    this.loggersInstances.debug(this.formatValue(value, options, "debug"));
  }

  public info(value: string, options?: LogOptions) {
    this.runPlugins("info");
    this.loggersInstances.info(this.formatValue(value, options, "info"));
  }

  public warn(value: string, options?: LogOptions) {
    this.runPlugins("warn");
    this.loggersInstances.warn(this.formatValue(value, options, "warn"));
  }

  public error(value: string, options?: LogOptions) {
    this.runPlugins("error");
    this.loggersInstances.error(this.formatValue(value, options, "error"));
  }
}
