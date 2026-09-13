import test from "node:test";
import assert from "node:assert/strict";
import {
  preferReadableFormats,
  isFileMessage,
  hasRealMedia,
  guessAttachment,
  classifyAttachments,
} from "../src/zalo_attachments.js";

test("preferReadableFormats drops jxl when jpg variant exists", () => {
  const urls = [
    "https://res.zalo.me/gr/jxl/photo123/img.jxl",
    "https://res.zalo.me/gr/jpg/photo123/img.jpg",
  ];
  const filtered = preferReadableFormats(urls);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0], "https://res.zalo.me/gr/jpg/photo123/img.jpg");
});

test("preferReadableFormats keeps jxl when no other variant exists", () => {
  const urls = ["https://res.zalo.me/gr/jxl/photo123/img.jxl"];
  const filtered = preferReadableFormats(urls);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0], "https://res.zalo.me/gr/jxl/photo123/img.jxl");
});

test("guessAttachment detects PDF, DOCX, and video MIME types", () => {
  const pdf = guessAttachment("https://example.com/bao_cao.pdf", { name: "bao_cao.pdf" });
  assert.equal(pdf.mime, "application/pdf");
  assert.equal(pdf.kind, "document");

  const docx = guessAttachment("https://example.com/hop_dong.docx", { name: "hop_dong.docx" });
  assert.equal(docx.mime, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  assert.equal(docx.kind, "document");

  const mp4 = guessAttachment("https://example.com/video.mp4", { name: "video.mp4" });
  assert.equal(mp4.mime, "video/mp4");
  assert.equal(mp4.kind, "video");
});

test("classifyAttachments correctly classifies share.file as document", () => {
  const msg = {
    msgType: "share.file",
    data: {
      content: {
        title: "Bao_cao.xlsx",
        href: "https://files.zalo.me/download/report.xlsx",
      },
    },
  };
  const attachments = classifyAttachments(msg, ["https://files.zalo.me/download/report.xlsx"]);
  assert.equal(attachments.length, 1);
  assert.equal(attachments[0].mime, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  assert.equal(attachments[0].kind, "document");
  assert.equal(attachments[0].name, "Bao_cao.xlsx");
});
