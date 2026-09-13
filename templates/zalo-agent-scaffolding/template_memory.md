# Lớp 4: Memory — Cơ Chế Ghi Nhớ Khách Hàng Bền Vững (Durable Facts)

Trí nhớ bền vững giúp AI Agent nhận ra khách quen, hiểu lịch sử và sở thích của từng người mà không cần họ phải nhắc lại nhiều lần.

---

## 1. Nguyên Tắc Ghi Nhớ
* **Chỉ lưu sự thật bền vững (Declarative Facts):**
  - Tên gọi mong muốn, cách xưng hô của khách.
  - Ngành nghề, lĩnh vực kinh doanh, địa phương sinh sống.
  - Sở thích, khẩu vị, yêu cầu đặc biệt (ví dụ: *"khách ăn chay"*, *"thích đi tour sáng sớm"*).
  - Lịch sử đơn hàng, gói dịch vụ đã mua, ngày sinh nhật.
* **Không lưu trữ tràn lan (Anti-Bloat):**
  - Không copy nguyên văn tin nhắn trò chuyện vào bộ nhớ.
  - Không lưu những câu cảm thán, lời chào xã giao nhất thời.
  - Tối ưu hóa dung lượng: Mỗi ghi chú chỉ 1–2 dòng súc tích, giàu tín hiệu.

---

## 2. Cấu Trúc File Trí Nhớ Mẫu (`memory.json` hoặc Markdown)

```markdown
### Hồ Sơ Khách Hàng: Anh Tuấn (Zalo UID: <ZALO_USER_ID>)
- Ngành nghề: Đại lý Du lịch & Vận chuyển Phú Quý.
- Sản phẩm quan tâm: Gói AI Agent chăm sóc tour tự động 24/7.
- Ghi chú riêng: Thích trả lời ngắn gọn, hay nhắn việc vào buổi sáng sớm, không thích gọi điện thoại ban đêm.
- Lần tương tác gần nhất: Đã nhận báo giá gói Advisor 3 tháng ngày 10/09/2026.
```

---

## 3. Cách Sử Dụng Trí Nhớ Khi Giao Tiếp
* Khi khách nhắn lại sau nhiều ngày:
  * *Dạ em chào anh Tuấn! Hôm nay tour Phú Quý của bên anh chạy êm không ạ? Em có thể hỗ trợ gì cho anh hôm nay nè?*
* Khách sẽ cảm nhận được sự chu đáo, tận tâm như một nhân viên kỳ cựu đang chăm sóc riêng cho họ.
