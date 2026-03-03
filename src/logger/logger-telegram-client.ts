/**
 * @section imports:externals
 */
// empty

/**
 * @section imports:internals
 */
import { LoggerTelegramError } from "./logger-telegram-error.ts";
import type { LoggerDependencies, LoggerTelegramConfig, TelegramParseMode, TelegramResponsePayload } from "./logger-types.ts";

/**
 * @section consts
 */
const DEFAULT_PARSE_MODE: TelegramParseMode = "HTML";

/**
 * @section types
 */
// empty

export default class LoggerTelegramClient {
  /**
   * @section private:attributes
   */
  private readonly baseUrl: string;

  private readonly chatId: string;

  private readonly parseMode: TelegramParseMode;

  private readonly fetchFn: typeof fetch;

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
  public constructor(config: LoggerTelegramConfig, dependencies: LoggerDependencies) {
    this.baseUrl = `https://api.telegram.org/bot${config.botToken}`;
    this.chatId = config.chatId;
    this.parseMode = config.parseMode ?? DEFAULT_PARSE_MODE;
    this.fetchFn = dependencies.fetch;
  }

  /**
   * @section static:properties
   */
  // empty

  /**
   * @section factory
   */
  public static fromConfig(config: LoggerTelegramConfig, dependencies: LoggerDependencies): LoggerTelegramClient {
    const result = new LoggerTelegramClient(config, dependencies);
    return result;
  }

  /**
   * @section private:methods
   */
  private buildMessage(rawText: string): string {
    const result = rawText;
    return result;
  }

  private async parseResponse(response: Response): Promise<TelegramResponsePayload> {
    let payload: TelegramResponsePayload = { ok: false, description: "Invalid Telegram response payload." };
    const parsed = await response.json();
    if (this.isTelegramResponsePayload(parsed)) {
      payload = parsed;
    }
    return payload;
  }

  private isTelegramResponsePayload(value: unknown): value is TelegramResponsePayload {
    const isObject = typeof value === "object" && value !== null;
    const hasOk = isObject && "ok" in value && typeof (value as { ok: unknown }).ok === "boolean";
    const result = hasOk;
    return result;
  }

  /**
   * @section protected:methods
   */
  // empty

  /**
   * @section public:methods
   */
  public async post(rawText: string): Promise<unknown> {
    const text = this.buildMessage(rawText);
    const response = await this.fetchFn(`${this.baseUrl}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: this.chatId, text, parse_mode: this.parseMode }),
    });
    const data = await this.parseResponse(response);
    if (!data.ok) {
      const description = data.description ?? "Unknown Telegram API error";
      throw new LoggerTelegramError(`Telegram sendMessage failed: ${description}`);
    }
    const result = data.result;
    return result;
  }

  /**
   * @section static:methods
   */
  // empty
}
