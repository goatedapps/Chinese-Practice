import { test } from "node:test";
import assert from "node:assert/strict";
import { createContentCache } from "../src/lib/contentCache";

test("simultaneous requests share one load and retain its result", async () => {
  const cache = createContentCache<number>();
  let calls = 0;
  const load = async () => { calls++; return 42; };
  const first = cache("p3:1", load);
  const second = cache("p3:1", load);
  assert.equal(first, second);
  assert.deepEqual(await Promise.all([first, second]), [42, 42]);
  assert.equal(await cache("p3:1", load), 42);
  assert.equal(calls, 1);
});

test("a failed load can be retried", async () => {
  const cache = createContentCache<number>();
  await assert.rejects(cache("p3:1", async () => { throw new Error("offline"); }), /offline/);
  assert.equal(await cache("p3:1", async () => 7), 7);
});

test("lesson caches stay separate between levels", async () => {
  const cache = createContentCache<string>();
  const [p3, p5] = await Promise.all([
    cache("p3:1", async () => "P3 lesson"),
    cache("p5:1", async () => "P5 lesson")
  ]);
  assert.equal(p3, "P3 lesson");
  assert.equal(p5, "P5 lesson");
});
