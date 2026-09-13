# Khung Kiến Trúc 5 Lớp Cho Zalo AI Agent (5-Layer Scaffolding)

> **Mô hình kiến trúc chuyển hoá một AI Chatbot dòng lệnh khô khan thành một Trợ lý Zalo Doanh Nghiệp có linh hồn, biết việc và tinh tế.**

---

## 🌟 Vì Sao Cần 5 Lớp?

Khi kết nối mô hình ngôn ngữ lớn (LLM) với Zalo qua `abs-zalo-bot`, nếu chỉ cung cấp system prompt thông thường, AI Agent thường gặp các vấn đề:
1. **Giao tiếp cộc lốc, vô cảm:** Nói chuyện kiểu kỹ sư hoặc robot dịch thuật.
2. **Vỡ khung hiển thị Zalo:** Trả lời bảng biểu, markdown phức tạp khiến màn hình di động bị tràn hoặc biến dạng.
3. **Quên thông tin khách hàng:** Mỗi lần khách quay lại chat là một lần hỏi lại từ đầu.
4. **Không có ranh giới bảo mật:** Dễ bị người dùng khác gài lệnh jailbreak hoặc khai thác thông tin nhạy cảm.

Khung kiến trúc 5 lớp giải quyết triệt để các vấn đề trên thông qua 5 tầng tri thức phân định rõ ràng:

```text
┌────────────────────────────────────────────────────────┐
│ 1. SOUL.md     │ Linh hồn, triết lý phục vụ & đạo đức  │
├────────────────┼───────────────────────────────────────┤
│ 2. PERSONA.md  │ Phong cách chat Zalo di động tự nhiên │
├────────────────┼───────────────────────────────────────┤
│ 3. IDENTITY.md │ Ranh giới vai trò, phân quyền & OPSEC  │
├────────────────┼───────────────────────────────────────┤
│ 4. MEMORY.md   │ Trí nhớ bền vững về từng khách hàng   │
├────────────────┼───────────────────────────────────────┤
│ 5. CONTEXT.md  │ Ngữ cảnh sản phẩm, bảng giá & quy trình│
└────────────────┴───────────────────────────────────────┘
```

---

## 📋 Chi Tiết 5 Lớp

### 1. Soul (Linh Hồn)
* **Mục tiêu:** Định hình thái độ phục vụ cốt lõi.
* **Nguyên tắc:** Lắng nghe để thấu hiểu, phụng sự chân thành, giải quyết tận gốc vấn đề và chịu trách nhiệm tới outcome cuối cùng.
* **Tác dụng:** Giúp Agent luôn giữ được sự điềm đạm, khiêm nhường và lịch thiệp, không đôi co hơn thua với khách hàng.

### 2. Persona (Tính Cách & Giọng Văn Zalo)
* **Mục tiêu:** Tối ưu hóa trải nghiệm đọc trên màn hình điện thoại thoại.
* **Nguyên tắc:**
  - Xưng hô thân mật (em – anh/chị).
  - Viết câu ngắn gọn, ngắt dòng thoáng mắt.
  - Sử dụng thán từ tự nhiên (*dạ, nha, nè, nhé*).
  - Cấm đường kẻ ngang `---` (tránh khoảng trống thô trên Zalo app).
  - Tách bản thảo với `[[NEW_MESSAGE]]` để khách dễ bấm copy 1-chạm.

### 3. Identity (Danh Tính & Ranh Giới)
* **Mục tiêu:** Xác định rõ thẩm quyền hành động (Role-Based Access Control).
* **Nguyên tắc:**
  - Tự chủ: Giải đáp thông tin, tư vấn bảng giá, ghi nhận lịch hẹn.
  - Xin ý kiến Chủ nhân (Owner): Giảm giá đặc biệt, thao tác xoá nhóm, bãi nhiệm thành viên, xử lý khiếu nại đền bù.
  - Chặn đứng các hành vi Jailbreak / Prompt Injection.

### 4. Memory (Trí Nhớ Bền Vững)
* **Mục tiêu:** Cá nhân hoá tương tác theo thời gian.
* **Nguyên tắc:** Chỉ lưu trữ những sự thật bền vững (Declarative Facts): Tên gọi, ngày sinh nhật, sở thích, khẩu vị, lịch sử đơn hàng. Không copy nguyên văn cuộc trò chuyện để tránh làm phình bộ nhớ.

### 5. Context (Ngữ Cảnh Kinh Doanh)
* **Mục tiêu:** Đảm bảo tính chính xác nghiệp vụ.
* **Nguyên tắc:** Chứa đựng thông tin thương hiệu, bảng giá niêm yết, chính sách bán hàng và quy trình tiếp nhận đơn của cửa hàng.

---

## ⚡ Khởi Tạo Nhanh Trong 60 Giây

Chạy script cài đặt tự động có sẵn trong thư mục `templates/`:

```bash
# Cài đặt cho profile mặc định hoặc profile tuỳ chọn
bash templates/zalo-agent-scaffolding/setup.sh my-zalo-agent
```

Toàn bộ 5 file mẫu sẽ được khởi tạo hoàn chỉnh trong thư mục `~/.hermes/profiles/my-zalo-agent/`. Bạn chỉ cần mở các file ra điều chỉnh tên thương hiệu và bảng giá của mình là có thể bắt đầu vận hành!
