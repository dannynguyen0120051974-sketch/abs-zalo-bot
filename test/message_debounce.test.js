import test from "node:test";
import assert from "node:assert/strict";
import { debounceMessage, debounceKey, DEFAULT_WINDOW_MS } from "../src/message_debounce.js";

test("debounceKey returns stable composite key", () => {
  const ev = { account_id: "A", source_id: "G1", sender_id: "U1" };
  assert.equal(debounceKey(ev), "A:G1:U1");
});

test("debounceMessage flushes single message after window", async () => {
  const pending = new Map();
  const flushed = [];
  debounceMessage(pending, "k1", "xin chào", (k, text) => flushed.push({ k, text }), 30);
  await new Promise(r => setTimeout(r, 50));
  assert.equal(flushed.length, 1);
  assert.equal(flushed[0].text, "xin chào");
  assert.equal(flushed[0].k, "k1");
});

test("debounceMessage concatenates rapid burst into one flush", async () => {
  const pending = new Map();
  const flushed = [];
  const flush = (k, text) => flushed.push(text);
  debounceMessage(pending, "k2", "anh ơi", flush, 60);
  debounceMessage(pending, "k2", "giá tour Phú Quý", flush, 60);
  debounceMessage(pending, "k2", "cho 3 người cuối tuần", flush, 60);
  await new Promise(r => setTimeout(r, 90));
  assert.equal(flushed.length, 1, "Should flush exactly once");
  assert.equal(flushed[0], "anh ơi\ngiá tour Phú Quý\ncho 3 người cuối tuần");
});

test("different keys flush independently", async () => {
  const pending = new Map();
  const flushed = [];
  const flush = (k, text) => flushed.push({ k, text });
  debounceMessage(pending, "user-A", "câu 1", flush, 40);
  debounceMessage(pending, "user-B", "câu B", flush, 40);
  await new Promise(r => setTimeout(r, 70));
  assert.equal(flushed.length, 2);
  const keys = flushed.map(f => f.k).sort();
  assert.deepEqual(keys, ["user-A", "user-B"]);
});

test("DEFAULT_WINDOW_MS is within 1000-3000ms reasonable range", () => {
  assert.ok(DEFAULT_WINDOW_MS >= 1000 && DEFAULT_WINDOW_MS <= 3000,
    `Window ${DEFAULT_WINDOW_MS}ms out of [1000,3000]`);
});
