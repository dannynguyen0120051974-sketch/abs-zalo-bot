import test from "node:test";
import assert from "node:assert/strict";
import { resolveQuoteText, enrichTextWithQuote } from "../src/quote_resolver.js";

test("resolveQuoteText returns empty string when no quote", () => {
  assert.equal(resolveQuoteText(undefined), "");
  assert.equal(resolveQuoteText(null), "");
});

test("resolveQuoteText handles plain string content", () => {
  assert.equal(resolveQuoteText({ content: "giá tour bao nhiêu?" }), "giá tour bao nhiêu?");
});

test("resolveQuoteText handles object content with title", () => {
  const quote = { content: { title: "ảnh resort.jpg", type: 2 } };
  assert.equal(resolveQuoteText(quote), "ảnh resort.jpg");
});

test("resolveQuoteText falls back to media type label for unknown object", () => {
  // type 2 = ảnh
  assert.equal(resolveQuoteText({ content: { type: 2 } }), "[Ảnh]");
  // type 5 = file
  assert.equal(resolveQuoteText({ content: { type: 5 } }), "[File]");
  // type 6 = sticker
  assert.equal(resolveQuoteText({ content: { type: 6 } }), "[Nhãn dán]");
});

test("resolveQuoteText truncates long content to 500 chars", () => {
  const long = "a".repeat(1000);
  assert.equal(resolveQuoteText({ content: long }).length, 500);
});

test("enrichTextWithQuote prepends [Trích dẫn] prefix", () => {
  const event = { text: "Cái này còn hàng không?" };
  const quote = { content: "ảnh áo dài xanh" };
  const result = enrichTextWithQuote(event, quote);
  assert.equal(result, "[Trích dẫn] ảnh áo dài xanh\nCái này còn hàng không?");
});

test("enrichTextWithQuote returns plain text when no quote", () => {
  const event = { text: "xin chào" };
  assert.equal(enrichTextWithQuote(event, undefined), "xin chào");
});
