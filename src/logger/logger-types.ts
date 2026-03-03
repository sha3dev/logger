import type chalk from "chalk";

export type LoggerType = "debug" | "info" | "warn" | "error";

export type LogColor = keyof typeof chalk | string;

export type LogOptions = {
  readonly color?: LogColor;
  readonly telegram?: boolean;
};

export type TelegramParseMode = "Markdown" | "MarkdownV2" | "HTML";

export type LoggerMergeChunksConfig = {
  readonly enabled?: boolean;
  readonly flushMs?: number;
};

export type LoggerTelegramConfig = {
  readonly chatId: string;
  readonly botToken: string;
  readonly parseMode?: TelegramParseMode;
};

export type LoggerConfig = {
  readonly loggerName: string | null;
  readonly mergeChunks?: LoggerMergeChunksConfig;
  readonly telegram?: LoggerTelegramConfig;
};

export type TelegramResponsePayload = {
  ok: boolean;
  description?: string;
  result?: unknown;
};

export type LoggerDependencies = {
  readonly clock: () => Date;
  readonly output: Record<LoggerType, (message?: unknown, ...optionalParams: unknown[]) => void>;
  readonly scheduleTimeout: (callback: () => void, timeoutMs: number) => ReturnType<typeof setTimeout>;
  readonly clearScheduledTimeout: (handle: ReturnType<typeof setTimeout>) => void;
  readonly fetch: typeof fetch;
};
