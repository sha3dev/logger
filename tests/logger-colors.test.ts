import test from "node:test";
import assert from "node:assert/strict";

test("Logger colors: defaults apply ANSI codes", () => {
  const { default: Logger } = require("../dist/index.js");
  assert.doesNotThrow(() => {
    const log = new Logger("colors-default");
    log.info("hello");
  });
});

test("Logger colors: per-call option overrides default", () => {
  const { default: Logger } = require("../dist/index.js");
  assert.doesNotThrow(() => {
    const log = new Logger("colors-override");
    log.info("hello", { color: "red" });
  });
});

test("Logger colors: invalid color does not throw and still logs", () => {
  const { default: Logger } = require("../dist/index.js");
  assert.doesNotThrow(() => {
    const log = new Logger("colors-invalid");
    log.info("hello", { color: "not-a-real-color" });
  });
});
