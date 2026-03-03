# @sha3/logger

Typed logger for Node.js/TypeScript with console levels and optional Telegram delivery.

## TL;DR (60 seconds)

```bash
npm install @sha3/logger
```

```ts
import Logger from "@sha3/logger";

const logger = new Logger({ loggerName: "api" });
logger.info("Server started");
logger.error("Gateway degraded", { telegram: true });
```

## Why this exists

`@sha3/logger` gives teams a compact logging primitive with:

- typed log levels,
- per-message color overrides,
- optional chunk merge for streamed logs,
- optional Telegram output,
- typed runtime errors for invalid configuration and Telegram failures.

## Installation

```bash
npm install @sha3/logger
```

## Quick Start

```ts
import Logger from "@sha3/logger";

const logger = new Logger({
  loggerName: "payments",
  mergeChunks: { enabled: true, flushMs: 50 },
  telegram: {
    chatId: process.env.TELEGRAM_CHAT_ID ?? "",
    botToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  },
});

logger.debug("debug details");
logger.info("payment accepted");
logger.warn("retrying gateway call");
logger.error("payment failed");
logger.error("payment failed", { telegram: true });
```

## Public API Reference

### Default export

- `Logger`: main class.

### Named exports

- `LoggerConfigurationError`: thrown when constructor config is invalid.
- `LoggerTelegramError`: thrown when Telegram API fails.
- `LoggerType`: `"debug" | "info" | "warn" | "error"`.
- `LogColor`: string color value (chalk method name, color keyword, hex, etc.).
- `LogOptions`: `{ color?: LogColor }`.
- `LoggerMergeChunksConfig`: `{ enabled?: boolean; flushMs?: number }`.
- `LoggerTelegramConfig`: `{ chatId: string; botToken: string; parseMode?: "Markdown" | "MarkdownV2" | "HTML" }`.
- `LoggerConfig`: logger configuration object.
- `LoggerDependencies`: injectable runtime dependencies for output/time/scheduling/fetch.

### Logger constructor

```ts
new Logger(loggerConfig?: LoggerConfig | string, dependencies?: Partial<LoggerDependencies>)
```

Behavior expectations:

- When `loggerConfig` is a string, it is treated as `loggerName`.
- Default base name comes from `CONFIG.BASE_LOGGER_NAME`.
- Invalid config throws `LoggerConfigurationError`.

### Instance methods

- `debug(value: string, options?: LogOptions): void`
- `info(value: string, options?: LogOptions): void`
- `warn(value: string, options?: LogOptions): void`
- `error(value: string, options?: LogOptions): void`

Telegram behavior via `options.telegram`:

- If `options.telegram === true` and Telegram config exists, the same message is sent to Telegram Bot API `sendMessage`.
- If `options.telegram === true` and Telegram config is missing, `LoggerTelegramError` is thrown.

### Static methods

- `Logger.fromConfig(...)`: factory alias of constructor.
- `Logger.isLoggerType(value: string): value is LoggerType`

## Integration Guide (another project)

### 1. Install

```bash
npm install @sha3/logger
```

### 2. Import

```ts
import Logger, { LoggerTelegramError, type LoggerConfig } from "@sha3/logger";
```

### 3. Configure

```ts
const loggerConfig: LoggerConfig = {
  loggerName: "worker",
  mergeChunks: { enabled: true, flushMs: 80 },
  telegram: {
    chatId: process.env.TELEGRAM_CHAT_ID ?? "",
    botToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
    parseMode: "HTML",
  },
};

const logger = new Logger(loggerConfig);
```

### 4. Handle Telegram boundary errors

```ts
try {
  logger.info("worker ready", { telegram: true });
} catch (error) {
  if (error instanceof LoggerTelegramError) {
    process.stderr.write(`${error.name}: ${error.message}\n`);
  }
}
```

## Configuration Reference (`src/config.ts`)

Default export object:

- `BASE_LOGGER_NAME`: base namespace for logger names.
  - Source: `process.env.BASE_LOGGER_NAME ?? "default"`.
- `DEFAULT_MERGE_FLUSH_MS`: fallback flush interval when merge mode is enabled and no `flushMs` is provided.
  - Current value: `50`.

## Compatibility

- Runtime: Node.js with ESM support.
- Module format: package is `"type": "module"` and exports ESM/CJS build artifacts from `dist`.
- TypeScript: native `.d.ts` provided via `types` export.
- Import style: use standard package import (`import Logger from "@sha3/logger"`).

## Development

```bash
npm install
npm run check
npm run build
```

`npm run check` runs lint, format verification, typecheck, and tests.

## AI Usage

If you use an assistant in this repository:

- Instruct it to read and obey `AGENTS.md` first.
- Require class-first design with constructor injection.
- Require single-return control flow and braces on all blocks.
- Require tests for behavior changes.
- Require `npm run check` before finalizing.

## License

[MIT](LICENSE)
