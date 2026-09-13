/**
 * Đọc và giải mã nhãn dán (sticker) của Zalo.
 *
 * Tin sticker Zalo tới dưới dạng `chat.sticker` với nội dung `{id, catId, type}`.
 * Module này tra cứu chi tiết sticker (`getStickersDetail`) để lấy nhãn chữ và ảnh tĩnh PNG,
 * giúp các tầng sau (lưu lịch sử, AI vision, tóm tắt) đọc được như tin bình thường.
 */

const LOOKUP_TIMEOUT_MS = 4000;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_LIMIT = 500;

export function isStickerMessage(msgType) {
  return /sticker/i.test(String(msgType ?? ""));
}

/** Lấy `{id, cateId, type}` của sticker trong một tin, hoặc null. */
export function stickerRefOf(msg) {
  const msgType = msg?.data?.msgType ?? msg?.msgType;
  if (!isStickerMessage(msgType)) return null;
  const content = msg?.data?.content ?? msg?.content;
  if (!content || typeof content !== "object") return null;
  const id = Number(content.id);
  if (!Number.isFinite(id) || id <= 0) return null;
  return {
    id,
    cateId: Number(content.catId ?? content.cateId) || 0,
    type: Number(content.type) || 0,
  };
}

// Zalo sticker text thường chứa mã nội bộ như [^10751.27703^], cần loại bỏ mã này
const CODE_LABEL_RE = /^\[\^[\d.]+\^\]$/;

export function stickerText(detail) {
  const label = String(detail?.text ?? "").trim();
  return label && !CODE_LABEL_RE.test(label) ? `[Nhãn dán: ${label}]` : "[Nhãn dán]";
}

export function stickerAttachment(detail) {
  const url = String(detail?.stickerUrl ?? "").trim();
  if (!url) return null;
  return {
    url,
    name: `sticker-${detail?.id ?? ""}.png`.replace("-.png", ".png"),
    mime: "image/png",
    kind: "image",
  };
}

export function createStickerDirectory({
  fetchDetail,
  ttlMs = CACHE_TTL_MS,
  limit = CACHE_LIMIT,
  timeoutMs = LOOKUP_TIMEOUT_MS,
  now = Date.now,
} = {}) {
  const cache = new Map();
  return {
    async get(id) {
      const key = String(id);
      const hit = cache.get(key);
      if (hit && now() - hit.at < ttlMs) return hit.detail;
      let detail = null;
      let timer = null;
      try {
        detail = await Promise.race([
          Promise.resolve(typeof fetchDetail === "function" ? fetchDetail(Number(id)) : null),
          new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error("sticker_lookup_timeout")), timeoutMs);
          }),
        ]);
      } catch {
        return hit?.detail ?? null;
      } finally {
        if (timer) clearTimeout(timer);
      }
      const first = Array.isArray(detail) ? detail[0] : detail;
      if (!first || typeof first !== "object") return hit?.detail ?? null;
      if (cache.size >= limit) cache.delete(cache.keys().next().value);
      cache.set(key, { at: now(), detail: first });
      return first;
    },
    clear() {
      cache.clear();
    },
  };
}

export async function enrichSticker(msg, directory) {
  const ref = stickerRefOf(msg);
  if (!ref) return null;
  const detail = directory ? await directory.get(ref.id) : null;
  const info = {
    id: ref.id,
    text: stickerText(detail),
    attachment: detail ? stickerAttachment(detail) : null,
  };
  if (msg?.data) msg.data.__sticker = info;
  return info;
}
