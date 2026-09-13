/**
 * Đổi "@Tên hiển thị" trong tin bot gửi vào nhóm thành tag Zalo thật.
 *
 * Tên phải khớp một người trong danh bạ nhóm và không có dấu hiệu còn tiếp;
 * hai người trùng tên thì để nguyên dạng chữ để tránh tag nhầm người.
 */

const NAME_CHAR = /[\p{L}\p{N}_]/u;
const NAME_CONTINUES = /^ \p{Lu}/u;

function normalize(text) {
  return String(text || "").toLocaleLowerCase("vi");
}

/**
 * @param {string} msg Chữ đã qua bộ dịch Markdown (vị trí tính trên chuỗi này).
 * @param {{uid: string, name: string}[]} members
 * @param {{selfUid?: string, continuesInNextChunk?: boolean}} options
 * @returns {{pos: number, len: number, uid: string}[]}
 */
export function findMentions(msg, members, { selfUid = "", continuesInNextChunk = false } = {}) {
  const text = String(msg ?? "");
  if (!text.includes("@") || !Array.isArray(members) || !members.length) return [];

  const uidsByName = new Map();
  for (const member of members) {
    const uid = String(member?.uid ?? member?.userId ?? member?.id ?? "");
    const name = String(member?.name ?? member?.displayName ?? member?.dName ?? "").trim();
    if (!uid || !name || uid === String(selfUid)) continue;
    const key = normalize(name);
    const entry = uidsByName.get(key) ?? { length: name.length, uids: new Set() };
    entry.uids.add(uid);
    uidsByName.set(key, entry);
  }

  // Khớp tên dài trước: "@Lương Hải Anh Cnt" không bị khớp nhầm thành "@Lương"
  const names = [...uidsByName.entries()].sort((a, b) => b[1].length - a[1].length);

  const mentions = [];
  for (let at = text.indexOf("@"); at !== -1; at = text.indexOf("@", at + 1)) {
    if (at > 0 && NAME_CHAR.test(text[at - 1])) continue; // a@b trong email
    const match = names.find(([key, { length }]) => {
      const after = text.slice(at + 1 + length);
      return (
        normalize(text.slice(at + 1, at + 1 + length)) === key &&
        !NAME_CHAR.test(after[0] ?? "") &&
        !NAME_CONTINUES.test(after) &&
        !(continuesInNextChunk && after.trim() === "")
      );
    });
    if (!match) continue;
    const [, { length, uids }] = match;
    if (uids.size !== 1) continue;
    mentions.push({ pos: at, len: length + 1, uid: [...uids][0] });
    at += length;
  }
  return mentions;
}

/**
 * Danh bạ thành viên từng nhóm, cache tạm để tối ưu tốc độ gửi tin.
 */
export function createMemberDirectory({ fetchMembers, ttlMs = 10 * 60 * 1000, now = Date.now } = {}) {
  const cache = new Map();
  return {
    async get(groupId) {
      const key = String(groupId);
      const hit = cache.get(key);
      if (hit && now() - hit.at < ttlMs) return hit.members;
      try {
        const res = typeof fetchMembers === "function" ? await fetchMembers(key) : [];
        const members = Array.isArray(res) ? res : Array.isArray(res?.members) ? res.members : [];
        cache.set(key, { at: now(), members });
        return members;
      } catch (err) {
        return hit?.members ?? [];
      }
    },
    clear() {
      cache.clear();
    },
  };
}
