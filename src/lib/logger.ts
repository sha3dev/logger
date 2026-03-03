/**
 * Logger
 */

/**
 * imports: externals
 */

import chalk from "chalk";

/**
 * imports: internals
 */

import CONFIG from "../config";

/**
 * types
 */

export type LoggerType = "debug" | "info" | "warn" | "error";

export type LogColor = (typeof chalk)["Color"];

export type LoggerPluginConfig = { name: string; options: any; invoke: (loggerType: LoggerType, value: string, options?: LogOptions) => void };

export type LogOptions = { color?: LogColor };

export type LoggerMergeChunksConfig = {
  enabled?: boolean;
  flushMs?: number;
};

export type LoggerConfig = {
  loggerName: string | null;
  plugins?: LoggerPluginConfig[];
  mergeChunks?: LoggerMergeChunksConfig;
};

/**
 * exports
 */
export default class Logger {
  /**
   * private: attributes
   */

  private baseLoggerName: string = CONFIG.BASE_LOGGER_NAME;

  private config: LoggerConfig;

  private loggerName: string;

  private readonly defaultColorizers: Record<LoggerType, (text: string) => string> = {
    debug: chalk.gray,
    info: chalk.blue,
    warn: chalk.yellow,
    error: chalk.red,
  };

  private mergeState: Partial<Record<LoggerType, { buffer: string; timer: ReturnType<typeof setTimeout> | null; lastOptions?: LogOptions }>> = {};

  /**
   * private: methods
   */

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private getPrefix(): string {
    return `[${this.loggerName}] [${this.getTimestamp()}]`;
  }

  private runPlugins(loggerType: LoggerType, value: string, options?: LogOptions) {
    if (this.config.plugins) {
      this.config.plugins.forEach(plugin => {
        plugin.invoke(loggerType, value, options);
      });
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

  private flushMerged(loggerType: LoggerType) {
    const state = this.mergeState[loggerType];
    if (!state) {
      return;
    }
    const { buffer, lastOptions, timer } = state;
    if (timer) {
      clearTimeout(timer);
    }
    this.mergeState[loggerType] = { buffer: "", timer: null };
    if (!buffer) {
      return;
    }
    console[loggerType](`${this.getPrefix()} ${this.formatValue(buffer, lastOptions, loggerType)}`);
  }

  private write(loggerType: LoggerType, value: string, options?: LogOptions) {
    const mergeCfg = this.config.mergeChunks;
    if (!mergeCfg?.enabled) {
      console[loggerType](`${this.getPrefix()} ${this.formatValue(value, options, loggerType)}`);
      return;
    }

    const flushMs = mergeCfg.flushMs ?? 50;
    const prev = this.mergeState[loggerType] ?? { buffer: "", timer: null };
    const nextBuffer = `${prev.buffer}${value}`;
    if (prev.timer) {
      clearTimeout(prev.timer);
    }

    const shouldFlushNow = value.includes("\n");
    const timer = shouldFlushNow
      ? null
      : setTimeout(() => {
          this.flushMerged(loggerType);
        }, flushMs);

    this.mergeState[loggerType] = { buffer: nextBuffer, timer, lastOptions: options ?? prev.lastOptions };
    if (shouldFlushNow) {
      this.flushMerged(loggerType);
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

    const nameParts = [this.baseLoggerName];
    if (this.config.loggerName && this.config.loggerName !== this.baseLoggerName) {
      nameParts.push(this.config.loggerName);
    }
    this.loggerName = nameParts.join(":");
  }

  /**
   * public: methods
   */

  public debug(value: string, options?: LogOptions) {
    this.runPlugins("debug", value, options);
    this.write("debug", value, options);
  }

  public info(value: string, options?: LogOptions) {
    this.runPlugins("info", value, options);
    this.write("info", value, options);
  }

  public warn(value: string, options?: LogOptions) {
    this.runPlugins("warn", value, options);
    this.write("warn", value, options);
  }

  public error(value: string, options?: LogOptions) {
    this.runPlugins("error", value, options);
    this.write("error", value, options);
  }

  public addPlugin(plugin: LoggerPluginConfig) {
    this.config.plugins = this.config.plugins ?? [];
    this.config.plugins.push(plugin);
  }
}
