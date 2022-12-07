import { describe, expect, test } from "vitest";
// import TaggedConsole from "../src/index";

// const console = new TaggedConsole("test");

describe("logger", () => {
  test("test debug", async () => {
    await expect(
      (async () =>
        // TODO: test
        new Promise((resolve) => {
          resolve(true);
        }))()
    ).resolves.toEqual(true);
  });

  test("test info", async () => {
    await expect(
      (async () =>
        // TODO: test
        new Promise((resolve) => {
          resolve(true);
        }))()
    ).resolves.toEqual(true);
  });

  test("test warn", async () => {
    await expect(
      (async () =>
        // TODO: test
        new Promise((resolve) => {
          resolve(true);
        }))()
    ).resolves.toEqual(true);
  });

  test("test error", async () => {
    await expect(
      (async () =>
        // TODO: test
        new Promise((resolve) => {
          resolve(true);
        }))()
    ).resolves.toEqual(true);
  });
});
