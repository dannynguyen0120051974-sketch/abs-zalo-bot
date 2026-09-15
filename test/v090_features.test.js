import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import {
  transcodeToM4a,
  withAudioExtension,
  createVoiceDedupGuard,
} from "../src/hermes_media.js";
import {
  extractBotNames,
  isBotMentioned,
  isBareCall,
} from "../src/zalo_mentions.js";
import { PolicyGuard } from "../src/policy.js";
import { Store } from "../src/store.js";

test("v0.9.0 audio helpers - withAudioExtension", () => {
  assert.equal(
    withAudioExtension("https://res-zalo.zadn.vn/voice_123"),
    "https://res-zalo.zadn.vn/voice_123.m4a"
  );
  assert.equal(
    withAudioExtension("https://res-zalo.zadn.vn/voice_123.m4a"),
    "https://res-zalo.zadn.vn/voice_123.m4a"
  );
  assert.equal(
    withAudioExtension("https://res-zalo.zadn.vn/voice_123.aac"),
    "https://res-zalo.zadn.vn/voice_123.aac"
  );
  assert.equal(withAudioExtension(null), null);
});

test("v0.9.0 audio helpers - createVoiceDedupGuard", () => {
  let fakeNow = 1000000;
  const guard = createVoiceDedupGuard({
    windowMs: 60000,
    now: () => fakeNow,
  });

  const tmpFile = path.join(os.tmpdir(), `test_voice_${Date.now()}.m4a`);
  fs.writeFileSync(tmpFile, "dummy audio content");

  try {
    assert.equal(guard.isDuplicate("chat_123", tmpFile), false);
    guard.record("chat_123", tmpFile, { ok: true, msg_id: "m1" });
    assert.equal(guard.isDuplicate("chat_123", tmpFile), true);
    assert.equal(guard.get("chat_123", tmpFile)?.msg_id, "m1");

    // Khác chat_id không bị chặn
    assert.equal(guard.isDuplicate("chat_456", tmpFile), false);

    // Sau khi hết windowMs thì không còn là duplicate
    fakeNow += 65000;
    assert.equal(guard.isDuplicate("chat_123", tmpFile), false);
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
});

test("v0.9.0 bot mentions - extractBotNames", () => {
  assert.deepEqual(extractBotNames("Amon"), ["amon"]);
  assert.deepEqual(extractBotNames("Coach Lan Anh"), [
    "coach lan anh",
    "lan anh",
    "coach",
    "lan",
    "anh",
  ]);
  assert.deepEqual(extractBotNames("Bé Voi"), ["bé voi", "voi", "bé"]);
  assert.deepEqual(extractBotNames(""), []);
});

test("v0.9.0 bot mentions - isBotMentioned", () => {
  const options = {
    displayName: "Amon AI",
    selfUid: "12345",
    isOwner: false,
  };

  // Người lạ gõ tag
  assert.equal(isBotMentioned("@Amon chào bạn", options), true);
  assert.equal(isBotMentioned("@AI chào bạn", options), true);
  assert.equal(isBotMentioned("@bot giúp tôi", options), true);
  assert.equal(isBotMentioned("chào bạn nha", options), false);

  // Người lạ gọi không có @ -> không trigger
  assert.equal(isBotMentioned("Amon ơi", options), false);

  // Chủ nhân (isOwner: true) gọi không cần @
  const ownerOptions = { ...options, isOwner: true };
  assert.equal(isBotMentioned("Amon ơi", ownerOptions), true);
  assert.equal(isBotMentioned("chào Amon", ownerOptions), true);
  assert.equal(isBotMentioned("Amon đâu rồi", ownerOptions), true);
  assert.equal(isBotMentioned("Amon: xem giúp anh tin này", ownerOptions), true);
  assert.equal(isBotMentioned("nhờ Amon", ownerOptions), true);
});

test("v0.9.0 bot mentions - isBareCall", () => {
  assert.equal(isBareCall("Amon ơi", "Amon"), true);
  assert.equal(isBareCall("@Amon", "Amon"), true);
  assert.equal(isBareCall("@bot đâu rồi?", "Amon"), true);
  assert.equal(isBareCall("alo Amon nhé", "Amon"), true);

  // Có nội dung câu hỏi cụ thể -> không phải bare call
  assert.equal(isBareCall("Amon thời tiết hôm nay thế nào?", "Amon"), false);
  assert.equal(isBareCall("@bot tóm tắt cuộc họp", "Amon"), false);
});

test("v0.9.0 policy - owner_only_groups", () => {
  const store = new Store(":memory:");
  const config = {
    default_account_id: "default",
    listen_all_groups: true,
    listener_only: false,
    owner_only_groups: new Set(["group_vip_999"]),
    sources: [],
    destination: { group_id: "" },
    rate_limit: { ingest_per_hour: 2000 },
  };

  const policyGuard = new PolicyGuard({ store, config });

  // Tin nhắn từ người thường trong group_vip_999 -> silent store
  const guestEvent = {
    account_id: "default",
    source_type: "group",
    source_id: "group_vip_999",
    source_name: "Cộng Đồng 999 Người",
    sender_id: "guest_user_1",
    is_self: false,
    text: "Mọi người ơi cho mình hỏi",
  };

  const guestResult = policyGuard.evaluateInbound(guestEvent);
  assert.equal(guestResult.allow, true);
  assert.equal(guestResult.reason, "owner_only_group_silent_store");
  assert.deepEqual(guestResult.actions, ["store"]);
  assert.equal(guestResult.policy.muted, true);
  assert.equal(guestResult.policy.mode, "listen_only");

  // Tin nhắn từ chính bot (is_self: true) trong group_vip_999 -> không bị chặn theo rule này
  const selfEvent = {
    ...guestEvent,
    is_self: true,
  };
  const selfResult = policyGuard.evaluateInbound(selfEvent);
  assert.notEqual(selfResult.reason, "owner_only_group_silent_store");

  // Tin nhắn từ owner được cấu hình role owner trong store
  store.upsertPermission({
    accountId: "default",
    userId: "owner_user_99",
    role: "owner",
  });
  const ownerEvent = {
    ...guestEvent,
    sender_id: "owner_user_99",
  };
  const ownerResult = policyGuard.evaluateInbound(ownerEvent);
  assert.notEqual(ownerResult.reason, "owner_only_group_silent_store");
});
