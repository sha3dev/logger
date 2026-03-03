/**
 * @section imports:externals
 */
import chalk from "chalk";

/**
 * @section imports:internals
 */
import CONFIG from "../config.ts";
import { LoggerConfigurationError } from "./logger-configuration-error.ts";
import LoggerTelegramClient from "./logger-telegram-client.ts";
import { LoggerTelegramError } from "./logger-telegram-error.ts";
import type { LogOptions, LoggerConfig, LoggerDependencies, LoggerMergeChunksConfig, LoggerTelegramConfig, LoggerType } from "./logger-types.ts";

/**
 * @section consts
 */
const LOGGER_TYPES: readonly LoggerType[] = ["debug", "info", "warn", "error"] as const;

/**
 * @section types
 */
type LoggerMergeState = {
  buffer: string;
  timer: ReturnType<typeof setTimeout> | null;
  lastOptions: LogOptions | undefined;
};

export default class Logger {
  /**
   * @section private:attributes
   */
  private readonly baseLoggerName: string;

  private readonly dependencies: LoggerDependencies;

  private readonly defaultColorizers: Record<LoggerType, (text: string) => string>;

  private readonly mergeState: Partial<Record<LoggerType, LoggerMergeState>>;

  private readonly telegramClient: LoggerTelegramClient | null;

  private config: LoggerConfig;

  private loggerName: string;

  /**
   * @section protected:attributes
   */
  // empty

  /**
   * @section private:properties
   */
  // empty

  /**
   * @section public:properties
   */
  // empty

  /**
   * @section constructor
   */
  public constructor(loggerConfig?: LoggerConfig | string, dependencies?: Partial<LoggerDependencies>) {
    this.baseLoggerName = CONFIG.BASE_LOGGER_NAME;
    this.dependencies = this.resolveDependencies(dependencies);
    this.defaultColorizers = { debug: chalk.gray, info: chalk.blue, warn: chalk.yellow, error: chalk.red };
    this.mergeState = {};
    this.config = this.resolveConfig(loggerConfig);
    this.validateConfig(this.config);
    this.loggerName = this.resolveLoggerName(this.config);
    this.telegramClient = this.resolveTelegramClient(this.config.telegram);
  }

  /**
   * @section static:properties
   */
  // empty

  /**
   * @section factory
   */
  public static fromConfig(loggerConfig?: LoggerConfig | string, dependencies?: Partial<LoggerDependencies>): Logger {
    const result = new Logger(loggerConfig, dependencies);
    return result;
  }

  /**
   * @section private:methods
   */
  private resolveDependencies(overrides?: Partial<LoggerDependencies>): LoggerDependencies {
    const defaultDependencies: LoggerDependencies = {
      clock: () => new Date(),
      output: { debug: console.debug, info: console.info, warn: console.warn, error: console.error },
      scheduleTimeout: (callback, timeoutMs) => setTimeout(callback, timeoutMs),
      clearScheduledTimeout: handle => clearTimeout(handle),
      fetch: (input, init) => fetch(input, init),
    };
    const mergedOutput = { ...defaultDependencies.output, ...(overrides?.output ?? {}) };
    const result: LoggerDependencies = {
      clock: overrides?.clock ?? defaultDependencies.clock,
      output: mergedOutput,
      scheduleTimeout: overrides?.scheduleTimeout ?? defaultDependencies.scheduleTimeout,
      clearScheduledTimeout: overrides?.clearScheduledTimeout ?? defaultDependencies.clearScheduledTimeout,
      fetch: overrides?.fetch ?? defaultDependencies.fetch,
    };
    return result;
  }

  private resolveConfig(loggerConfig?: LoggerConfig | string): LoggerConfig {
    let result: LoggerConfig = { loggerName: null };
    if (typeof loggerConfig === "string") {
      result = { loggerName: loggerConfig };
    } else {
      if (loggerConfig) {
        result = loggerConfig;
      }
    }
    return result;
  }

  private resolveLoggerName(config: LoggerConfig): string {
    const nameParts = [this.baseLoggerName];
    if (config.loggerName && config.loggerName !== this.baseLoggerName) {
      nameParts.push(config.loggerName);
    }
    const result = nameParts.join(":");
    return result;
  }

  private resolveTelegramClient(telegramConfig: LoggerTelegramConfig | undefined): LoggerTelegramClient | null {
    let result: LoggerTelegramClient | null = null;
    if (telegramConfig) {
      result = LoggerTelegramClient.fromConfig(telegramConfig, this.dependencies);
    }
    return result;
  }

  private validateConfig(config: LoggerConfig): void {
    this.validateLoggerName(config.loggerName);
    this.validateMergeConfig(config.mergeChunks);
    this.validateTelegramConfig(config.telegram);
  }

  private validateLoggerName(loggerName: string | null): void {
    const isValidType = typeof loggerName === "string" || loggerName === null;
    const isValidValue = typeof loggerName !== "string" || loggerName.trim().length > 0;
    if (!isValidType || !isValidValue) {
      throw new LoggerConfigurationError("Invalid logger configuration: 'loggerName' must be a non-empty string or null.");
    }
  }

  private validateMergeConfig(mergeConfig?: LoggerMergeChunksConfig): void {
    if (mergeConfig) {
      const hasFlushMs = typeof mergeConfig.flushMs !== "undefined";
      const isFlushNumber = typeof mergeConfig.flushMs === "number";
      const isFlushPositive = !hasFlushMs || (isFlushNumber && mergeConfig.flushMs > 0);
      if (!isFlushPositive) {
        throw new LoggerConfigurationError("Invalid logger configuration: 'mergeChunks.flushMs' must be a positive number.");
      }
    }
  }

  private validateTelegramConfig(telegram?: LoggerTelegramConfig): void {
    if (telegram) {
      const hasChatId = typeof telegram.chatId === "string" && telegram.chatId.trim().length > 0;
      const hasBotToken = typeof telegram.botToken === "string" && telegram.botToken.trim().length > 0;
      if (!hasChatId || !hasBotToken) {
        throw new LoggerConfigurationError("Invalid logger configuration: 'telegram.chatId' and 'telegram.botToken' are required.");
      }
    }
  }

  private getTimestamp(): string {
    const result = this.dependencies.clock().toISOString();
    return result;
  }

  private getPrefix(): string {
    const result = `[${this.loggerName}] [${this.getTimestamp()}]`;
    return result;
  }

  private getMergeState(loggerType: LoggerType): LoggerMergeState {
    const existingState = this.mergeState[loggerType];
    const resolvedState = existingState ?? { buffer: "", timer: null, lastOptions: undefined };
    this.mergeState[loggerType] = resolvedState;
    const result = resolvedState;
    return result;
  }

  private flushMerged(loggerType: LoggerType): void {
    const state = this.getMergeState(loggerType);
    const hadTimer = state.timer !== null;
    const nextBuffer = state.buffer;
    const nextOptions = state.lastOptions;
    if (hadTimer && state.timer) {
      this.dependencies.clearScheduledTimeout(state.timer);
    }
    state.timer = null;
    state.buffer = "";
    state.lastOptions = undefined;
    if (nextBuffer.length > 0) {
      const message = `${this.getPrefix()} ${this.formatValue(nextBuffer, nextOptions, loggerType)}`;
      this.dependencies.output[loggerType](message);
    }
  }

  private formatValue(value: string, options: LogOptions | undefined, loggerType: LoggerType): string {
    let result = value;
    const selectedColor = options?.color;
    if (selectedColor) {
      result = this.colorizeWithSelectedColor(value, selectedColor);
    } else {
      const colorizer = this.defaultColorizers[loggerType];
      result = colorizer(value);
    }
    return result;
  }

  private colorizeWithSelectedColor(value: string, color: string): string {
    let result = value;
    const trimmedColor = color.trim();
    if (trimmedColor.length > 0) {
      try {
        const chalkMap = chalk as unknown as Record<string, unknown>;
        const chalkCandidate = chalkMap[trimmedColor];
        const hasFunction = typeof chalkCandidate === "function";
        result = hasFunction ? (chalkCandidate as (text: string) => string)(value) : chalk.keyword(trimmedColor)(value);
      } catch {
        result = value;
      }
    }
    return result;
  }

  private write(loggerType: LoggerType, value: string, options?: LogOptions): void {
    this.validateTelegramOption(options);
    const mergeConfig = this.config.mergeChunks;
    const mergeEnabled = mergeConfig?.enabled === true;
    if (mergeEnabled) {
      this.writeMerged(loggerType, value, options, mergeConfig);
    } else {
      const message = `${this.getPrefix()} ${this.formatValue(value, options, loggerType)}`;
      this.dependencies.output[loggerType](message);
    }
    this.sendToTelegram(loggerType, value, options);
  }

  private writeMerged(loggerType: LoggerType, value: string, options: LogOptions | undefined, mergeConfig: LoggerMergeChunksConfig): void {
    const flushMs = mergeConfig.flushMs ?? CONFIG.DEFAULT_MERGE_FLUSH_MS;
    const state = this.getMergeState(loggerType);
    const hasTimer = state.timer !== null;
    if (hasTimer && state.timer) {
      this.dependencies.clearScheduledTimeout(state.timer);
    }
    state.buffer = `${state.buffer}${value}`;
    state.lastOptions = options ?? state.lastOptions;
    const shouldFlushNow = value.includes("\n");
    if (shouldFlushNow) {
      state.timer = null;
      this.flushMerged(loggerType);
    } else {
      state.timer = this.dependencies.scheduleTimeout(() => {
        this.flushMerged(loggerType);
      }, flushMs);
    }
  }

  private validateTelegramOption(options: LogOptions | undefined): void {
    const mustSendTelegram = options?.telegram === true;
    const hasClient = this.telegramClient !== null;
    if (mustSendTelegram && !hasClient) {
      throw new LoggerTelegramError("Telegram logging is not configured. Provide 'telegram.chatId' and 'telegram.botToken' in logger config.");
    }
  }

  private sendToTelegram(loggerType: LoggerType, value: string, options: LogOptions | undefined): void {
    const mustSendTelegram = options?.telegram === true;
    const hasClient = this.telegramClient !== null;
    if (mustSendTelegram && hasClient && this.telegramClient) {
      const telegramMessage = `${this.getPrefix()} [${loggerType}] ${value}`;
      void this.telegramClient.post(telegramMessage).catch(error => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.dependencies.output.error(`${this.getPrefix()} [telegram-error] ${errorMessage}`);
      });
    }
  }

  /**
   * @section protected:methods
   */
  // empty

  /**
   * @section public:methods
   */
  public debug(value: string, options?: LogOptions): void {
    this.write("debug", value, options);
  }

  public info(value: string, options?: LogOptions): void {
    this.write("info", value, options);
  }

  public warn(value: string, options?: LogOptions): void {
    this.write("warn", value, options);
  }

  public error(value: string, options?: LogOptions): void {
    this.write("error", value, options);
  }

  /**
   * @section static:methods
   */
  public static isLoggerType(value: string): value is LoggerType {
    const result = LOGGER_TYPES.includes(value as LoggerType);
    return result;
  }
}
