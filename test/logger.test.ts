import * as assert from "node:assert/strict";
import { test } from "node:test";

import Logger, { LoggerConfigurationError, LoggerTelegramError, type LoggerDependencies, type TelegramResponsePayload } from "../src/index.ts";

type CapturedLogs = {
  debug: string[];
  info: string[];
  warn: string[];
  error: string[];
};

type ScheduledTask = {
  id: number;
  callback: () => void;
};

type FetchCall = {
  readonly input: URL | RequestInfo;
  readonly init: RequestInit | undefined;
};

class LoggerTestHarness {
  private readonly logs: CapturedLogs = { debug: [], info: [], warn: [], error: [] };

  private readonly scheduledTasks: ScheduledTask[] = [];

  private readonly fetchCalls: FetchCall[] = [];

  private nextTaskId = 1;

  private nextTelegramPayload: TelegramResponsePayload = { ok: true, result: { message_id: 1 } };

  public createDependencies(): LoggerDependencies {
    const dependencies: LoggerDependencies = {
      clock: () => new Date("2026-03-03T12:34:56.789Z"),
      output: {
        debug: message => this.logs.debug.push(String(message ?? "")),
        info: message => this.logs.info.push(String(message ?? "")),
        warn: message => this.logs.warn.push(String(message ?? "")),
        error: message => this.logs.error.push(String(message ?? "")),
      },
      scheduleTimeout: callback => {
        const task: ScheduledTask = { id: this.nextTaskId, callback };
        this.nextTaskId += 1;
        this.scheduledTasks.push(task);
        return task.id as unknown as ReturnType<typeof setTimeout>;
      },
      clearScheduledTimeout: handle => {
        const taskId = Number(handle);
        const index = this.scheduledTasks.findIndex(task => task.id === taskId);
        if (index >= 0) {
          this.scheduledTasks.splice(index, 1);
        }
      },
      fetch: async (input, init) => {
        this.fetchCalls.push({ input, init });
        const response = new Response(JSON.stringify(this.nextTelegramPayload), { status: 200, headers: { "Content-Type": "application/json" } });
        return response;
      },
    };
    return dependencies;
  }

  public runScheduledTasks(): void {
    const tasksToRun = [...this.scheduledTasks];
    this.scheduledTasks.length = 0;
    for (const task of tasksToRun) {
      task.callback();
    }
  }

  public setTelegramPayload(payload: TelegramResponsePayload): void {
    this.nextTelegramPayload = payload;
  }

  public readInfoLogs(): readonly string[] {
    const logs = [...this.logs.info];
    return logs;
  }

  public readWarnLogs(): readonly string[] {
    const logs = [...this.logs.warn];
    return logs;
  }

  public readErrorLogs(): readonly string[] {
    const logs = [...this.logs.error];
    return logs;
  }

  public readFetchCalls(): readonly FetchCall[] {
    const calls = [...this.fetchCalls];
    return calls;
  }
}

test("logs include configured logger name and timestamp", () => {
  const harness = new LoggerTestHarness();
  const logger = new Logger("api", harness.createDependencies());

  logger.info("boot completed");

  const [entry = ""] = harness.readInfoLogs();
  assert.match(entry, /^\[default:api\] \[2026-03-03T12:34:56.789Z\] /);
  assert.match(entry, /boot completed/);
});

test("custom per-call color does not throw", () => {
  const harness = new LoggerTestHarness();
  const logger = new Logger("api", harness.createDependencies());

  assert.doesNotThrow(() => {
    logger.info("custom color", { color: "green" });
  });
});

test("invalid custom color gracefully falls back", () => {
  const harness = new LoggerTestHarness();
  const logger = new Logger("api", harness.createDependencies());

  assert.doesNotThrow(() => {
    logger.warn("invalid color", { color: "not-a-real-color" });
  });

  const [entry = ""] = harness.readWarnLogs();
  assert.match(entry, /invalid color/);
});

test("merge chunks flushes immediately when newline appears", () => {
  const harness = new LoggerTestHarness();
  const logger = new Logger({ loggerName: "stream", mergeChunks: { enabled: true, flushMs: 100 } }, harness.createDependencies());

  logger.info("chunk-a");
  logger.info("-chunk-b\n");

  const logs = harness.readInfoLogs();
  assert.equal(logs.length, 1);
  const mergedEntry = logs[0] ?? "";
  assert.match(mergedEntry, /chunk-a-chunk-b/);
});

test("merge chunks flushes when timer callback runs", () => {
  const harness = new LoggerTestHarness();
  const logger = new Logger({ loggerName: "stream", mergeChunks: { enabled: true, flushMs: 100 } }, harness.createDependencies());

  logger.info("delayed-a");
  logger.info("-delayed-b");
  harness.runScheduledTasks();

  const logs = harness.readInfoLogs();
  assert.equal(logs.length, 1);
  const mergedEntry = logs[0] ?? "";
  assert.match(mergedEntry, /delayed-a-delayed-b/);
});

test("invalid merge flush value throws typed configuration error", () => {
  assert.throws(
    () => {
      new Logger({ loggerName: "api", mergeChunks: { enabled: true, flushMs: 0 } });
    },
    (error: unknown) => {
      const isExpectedError = error instanceof LoggerConfigurationError;
      assert.equal(isExpectedError, true);
      return isExpectedError;
    },
  );
});

test("telegram option without telegram config throws typed error", () => {
  const harness = new LoggerTestHarness();
  const logger = new Logger("api", harness.createDependencies());

  assert.throws(
    () => {
      logger.info("message without telegram config", { telegram: true });
    },
    (error: unknown) => {
      const isExpectedError = error instanceof LoggerTelegramError;
      assert.equal(isExpectedError, true);
      return isExpectedError;
    },
  );
  assert.equal(harness.readFetchCalls().length, 0);
});

test("telegram option sends message when config exists", async () => {
  const harness = new LoggerTestHarness();
  const logger = new Logger(
    {
      loggerName: "api",
      telegram: { chatId: "123456", botToken: "token-123" },
    },
    harness.createDependencies(),
  );

  logger.info("telegram message", { telegram: true });
  await Promise.resolve();

  const [call] = harness.readFetchCalls();
  assert.ok(call);
  assert.match(String(call.input), /\/sendMessage$/);
  const body = String(call.init?.body ?? "");
  assert.match(body, /\[default:api\] \[2026-03-03T12:34:56.789Z\] \[info\] telegram message/);
});

test("telegram api failures do not throw to caller", async () => {
  const harness = new LoggerTestHarness();
  harness.setTelegramPayload({ ok: false, description: "chat not found" });
  const logger = new Logger(
    {
      loggerName: "api",
      telegram: { chatId: "123456", botToken: "token-123" },
    },
    harness.createDependencies(),
  );

  assert.doesNotThrow(() => {
    logger.info("telegram message", { telegram: true });
  });
  await Promise.resolve();
  assert.equal(harness.readFetchCalls().length, 1);
});
