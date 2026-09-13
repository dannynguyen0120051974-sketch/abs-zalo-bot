import test from "node:test";
import assert from "node:assert/strict";
import {
  isStickerMessage,
  stickerRefOf,
  stickerText,
  stickerAttachment,
  createStickerDirectory,
  enrichSticker,
} from "../src/zalo_stickers.js";

test("isStickerMessage identifies sticker message types", () => {
  assert.equal(isStickerMessage("chat.sticker"), true);
  assert.equal(isStickerMessage("STICKER"), true);
  assert.equal(isStickerMessage("chat.photo"), false);
  assert.equal(isStickerMessage(null), false);
});

test("stickerRefOf extracts id, cateId, and type", () => {
  const msg = {
    msgType: "chat.sticker",
    data: {
      content: { id: "12345", catId: "678", type: "1" },
    },
  };
  const ref = stickerRefOf(msg);
  assert.deepEqual(ref, { id: 12345, cateId: 678, type: 1 });
});

test("stickerText filters internal code labels", () => {
  assert.equal(stickerText({ text: "Vỗ tay" }), "[Nhãn dán: Vỗ tay]");
  assert.equal(stickerText({ text: "[^10751.27703^]" }), "[Nhãn dán]");
  assert.equal(stickerText(null), "[Nhãn dán]");
});

test("stickerAttachment produces valid image attachment descriptor", () => {
  const att = stickerAttachment({ id: 12345, stickerUrl: "https://zalo.me/s/12345.png" });
  assert.equal(att.url, "https://zalo.me/s/12345.png");
  assert.equal(att.mime, "image/png");
  assert.equal(att.kind, "image");
});

test("enrichSticker populates __sticker metadata on msg.data", async () => {
  const dir = createStickerDirectory({
    fetchDetail: async (id) => ({ id, text: "Thả tim", stickerUrl: "https://zalo.me/s/tim.png" }),
  });
  const msg = {
    msgType: "chat.sticker",
    data: { content: { id: 999 } },
  };
  const info = await enrichSticker(msg, dir);
  assert.equal(info.id, 999);
  assert.equal(info.text, "[Nhãn dán: Thả tim]");
  assert.equal(info.attachment.url, "https://zalo.me/s/tim.png");
  assert.equal(msg.data.__sticker.text, "[Nhãn dán: Thả tim]");
});
