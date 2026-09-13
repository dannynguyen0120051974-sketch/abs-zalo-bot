/**
 * Phân loại tệp đính kèm tin nhắn Zalo: ảnh, video, âm thanh, tài liệu.
 *
 * Khắc phục tình trạng tệp PDF/DOCX bị tải về như ảnh khiến model báo lỗi
 * "không đọc được ảnh", và tự động chọn định dạng JPG thay vì JXL.
 */

const MIME_BY_EXT = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif",
  ".webp": "image/webp", ".bmp": "image/bmp", ".heic": "image/heic", ".jxl": "image/jxl",
  ".mp4": "video/mp4", ".mov": "video/quicktime", ".mkv": "video/x-matroska", ".webm": "video/webm",
  ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".aac": "audio/aac", ".ogg": "audio/ogg", ".wav": "audio/wav",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".csv": "text/csv", ".txt": "text/plain", ".md": "text/markdown", ".json": "application/json",
  ".zip": "application/zip", ".rar": "application/vnd.rar", ".7z": "application/x-7z-compressed",
};

function extensionOf(value) {
  const clean = String(value ?? "").split(/[?#]/)[0];
  const match = /\.([A-Za-z0-9]{1,5})$/.exec(clean);
  return match ? `.${match[1].toLowerCase()}` : "";
}

/**
 * Ưu tiên các định dạng ảnh phổ biến (JPG, PNG, WEBP), loại bỏ bản JXL
 * nếu đã có bản định dạng đọc được khác trong cùng tin nhắn.
 */
export function preferReadableFormats(urls) {
  const info = urls.map((url) => {
    const m = /\/gr\/([a-z0-9]+)\/([^/]+)\//i.exec(String(url));
    return { url, format: (m?.[1] || "").toLowerCase(), group: m?.[2] || "" };
  });
  const groupsWithReadable = new Set(
    info.filter((x) => x.group && x.format && x.format !== "jxl").map((x) => x.group),
  );
  return info
    .filter((x) => !(x.format === "jxl" && groupsWithReadable.has(x.group)))
    .map((x) => x.url);
}

function kindOf(mime) {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "document";
}

export function isFileMessage(msgType) {
  return /file/i.test(String(msgType ?? ""));
}

export function hasRealMedia(msgType) {
  return !/(recommended|webchat|chat\.text|poll|ecard|undo|sticker|link)/i.test(String(msgType ?? ""));
}

export function guessAttachment(url, { name = "", msgType = "" } = {}) {
  const ext = extensionOf(name) || extensionOf(url);
  let mime = MIME_BY_EXT[ext] || "";
  if (!mime) {
    mime = isFileMessage(msgType) ? "application/octet-stream" : "image/jpeg";
  }
  return {
    url: String(url),
    name: String(name || "").trim() || (ext ? `file${ext}` : ""),
    mime,
    kind: kindOf(mime),
  };
}

export function classifyAttachments(msg, urls = []) {
  const content = msg?.data?.content ?? msg?.content;
  const msgType = msg?.data?.msgType ?? msg?.msgType ?? "";
  const title = content && typeof content === "object" ? String(content.title ?? "") : "";
  const href = content && typeof content === "object" ? String(content.href ?? "") : "";

  if (!hasRealMedia(msgType)) return [];
  const safeUrls = preferReadableFormats(urls);

  if (isFileMessage(msgType)) {
    const fileUrl = safeUrls.includes(href) ? href : safeUrls[0];
    return fileUrl ? [guessAttachment(fileUrl, { name: title, msgType })] : [];
  }
  return safeUrls.map((url) => guessAttachment(url, { name: url === href ? title : "", msgType }));
}
