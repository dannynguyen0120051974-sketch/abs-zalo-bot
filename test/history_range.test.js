import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Store } from "../src/store.js";

test("readHistoryRange retrieves and formats messages across hours", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "abs-zalo-range-"));
  const store = new Store(tmpDir);

  const now = Date.now();
  // Insert 2 messages in order
  store.putEvent({
    event_id: "evt_1",
    account_id: "acc_1",
    source_id: "group_999",
    source_type: "group",
    source_name: "Team ABS",
    sender_id: "u1",
    sender_name: "Teddy",
    message_id: "m1",
    message_type: "chat.text",
    text: "Chào cả team",
    created_at: new Date(now - 3600 * 1000).toISOString(),
  });

  store.putEvent({
    event_id: "evt_2",
    account_id: "acc_1",
    source_id: "group_999",
    source_type: "group",
    source_name: "Team ABS",
    sender_id: "u2",
    sender_name: "Amon",
    message_id: "m2",
    message_type: "chat.text",
    text: "Em chào anh Teddy",
    created_at: new Date(now - 1800 * 1000).toISOString(),
  });

  const res = store.readHistoryRange({ sourceId: "group_999", sinceHours: 24, limit: 10 });
  assert.equal(res.count, 2);
  assert.match(res.text, /Teddy: Chào cả team/);
  assert.match(res.text, /Amon: Em chào anh Teddy/);
  assert.equal(res.hasMore, false);

  store.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});
