import { describe, expect, test } from "vitest";
// import TaggedConsole from "../src/index";

// const console = new TaggedConsole("test");

describe("tagged-console", () => {
  test("test stdout", async () => {
    await expect(
      (async () =>
        // TODO: test
        new Promise((resolve) => {
          resolve(true);
        }))()
    ).resolves.toEqual(true);
  });

  test("test stderr", async () => {
    await expect(
      (async () =>
        // TODO: test
        new Promise((resolve) => {
          resolve(true);
        }))()
    ).resolves.toEqual(true);
  });

  test("test Date formatter", async () => {
    await expect(
      (async () =>
        // TODO: test
        new Promise((resolve) => {
          resolve(true);
        }))()
    ).resolves.toEqual(true);
  });
});
