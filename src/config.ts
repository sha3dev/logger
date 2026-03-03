const CONFIG = {
  BASE_LOGGER_NAME: process.env.BASE_LOGGER_NAME ?? "default",
  DEFAULT_MERGE_FLUSH_MS: 50,
} as const;

export default CONFIG;
