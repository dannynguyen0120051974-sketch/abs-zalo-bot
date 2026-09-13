/**
 * Message Debounce — gom bọt chat liên tiếp từ cùng 1 người trong cùng 1 luồng.
 *
 * Người Việt thường nhắn 3–4 câu ngắn liên tục trong 1–2 giây:
 *   "anh ơi" → "giá tour Phú Quý" → "cho 3 người cuối tuần"
 * Nếu không gom lại, Agent sẽ chạy 3 LLM call song song, trả lời đè nhau.
 *
 * YAGNI: Không cần queue phức tạp. Map<key, {timer, texts[]}> là đủ.
 */

const DEFAULT_WINDOW_MS = 1_800; // 1.8s — đủ để người gõ thêm câu, không làm khách đợi lâu

/**
 * @param {Map} pending   - Shared state: Map<key, {timer, parts, resolve}>
 * @param {string} key    - "<accountId>:<sourceId>:<senderId>"
 * @param {string} text   - Nội dung tin nhắn vừa tới
 * @param {Function} flush - Callback khi cửa sổ đóng: flush(key, combinedText)
 * @param {number} [windowMs]
 */
export function debounceMessage(pending, key, text, flush, windowMs = DEFAULT_WINDOW_MS) {
  const entry = pending.get(key);
  if (entry) {
    clearTimeout(entry.timer);
    entry.parts.push(text);
  } else {
    pending.set(key, { parts: [text], timer: null });
  }
  const slot = pending.get(key);
  slot.timer = setTimeout(() => {
    pending.delete(key);
    flush(key, slot.parts.join("\n"));
  }, windowMs);
}

/**
 * Xây debounce key từ normalized event.
 */
export function debounceKey(event) {
  return `${event.account_id}:${event.source_id}:${event.sender_id}`;
}

export { DEFAULT_WINDOW_MS };
