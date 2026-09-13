/**
 * Quote Resolution — giải mã tin nhắn trích dẫn (reply/quote) trong nhóm Zalo.
 *
 * Khi khách quote một ảnh cũ rồi gõ "Cái này còn hàng không?", Zalo gửi:
 *   { quote: { msgId, content: { ... } } }
 * Nếu Agent chỉ đọc text hiện tại, nó sẽ hỏi ngược "Cái nào ạ?" — trải nghiệm tệ.
 *
 * Module này extract nội dung quoted và dán vào context prompt dưới dạng:
 *   [Trích dẫn] <nội dung tin gốc>
 */

import { extractText } from "./schema.js";

/**
 * Giải mã payload quote từ Zalo message data.
 * @param {object|undefined} quote   - data.quote từ raw Zalo message
 * @returns {string}                 - "" nếu không có / không đọc được
 */
export function resolveQuoteText(quote) {
  if (!quote) return "";

  // Zalo quote payload có thể chứa content.title hoặc content trực tiếp
  const content = quote.content ?? quote.msg ?? quote;

  // Text thẳng
  if (typeof content === "string" && content.trim()) {
    return content.trim().slice(0, 500);
  }

  // Content là object (ảnh, file, tin nhắn có cấu trúc)
  if (typeof content === "object" && content !== null) {
    // Ưu tiên title (sticker name, file name, album title)
    const title = content.title || content.name || "";
    const body = extractText(content);
    // extractText thường trả về title khi không có body thật — loại trùng
    const combined = (body && body !== title)
      ? [title, body].filter(Boolean).join(" — ").trim()
      : title.trim();
    if (combined) return combined.slice(0, 500);

    // Fallback: loại media
    const mediaType =
      content.type === 2 ? "[Ảnh]"
      : content.type === 3 ? "[Video]"
      : content.type === 5 ? "[File]"
      : content.type === 6 ? "[Nhãn dán]"
      : content.type === 8 ? "[Audio]"
      : "[Nội dung đa phương tiện]";
    return mediaType;
  }

  return "";
}

/**
 * Nếu event có quoted content, gắn thêm prefix [Trích dẫn] vào text để Agent hiểu ngữ cảnh.
 * @param {object} event - Normalized event từ schema.js
 * @param {object|undefined} rawQuote - data.quote từ raw Zalo message
 * @returns {string}     - text đã kèm ngữ cảnh trích dẫn
 */
export function enrichTextWithQuote(event, rawQuote) {
  const quoteText = resolveQuoteText(rawQuote);
  if (!quoteText) return event.text;
  return `[Trích dẫn] ${quoteText}\n${event.text}`;
}
