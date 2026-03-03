import Logger from "./logger.ts";

export default Logger;
export { LoggerConfigurationError } from "./logger-configuration-error.ts";
export { LoggerTelegramError } from "./logger-telegram-error.ts";
export type {
  LogColor,
  LogOptions,
  LoggerConfig,
  LoggerDependencies,
  LoggerMergeChunksConfig,
  LoggerTelegramConfig,
  LoggerType,
  TelegramParseMode,
  TelegramResponsePayload,
} from "./logger-types.ts";
