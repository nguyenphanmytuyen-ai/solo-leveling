# TÀI LIỆU MÔ TẢ VIỆC SỬ DỤNG AI TRONG DỰ ÁN SOLO LEVELLING
*(Bản nháp định hướng dành cho nhóm sinh viên hiệu chỉnh theo thực tế)*

---

## 1. NGUYÊN TẮC SỬ DỤNG AI CỦA NHÓM
1. **AI là trợ lý lập trình, không thay thế tư duy kỹ thuật:** Nhóm chịu trách nhiệm 100% về kiến trúc, tính logic, trải nghiệm người dùng và mã nguồn được tích hợp vào dự án.
2. **Kiểm chứng độc lập (Verification Gate):** Mọi dòng mã hoặc câu hỏi do AI tạo ra đều phải vượt qua bộ kiểm thử tự động (`npm test`) và quy trình kiểm duyệt nội dung của các thành viên trong nhóm.
3. **Trung thực học thuật:** Nhóm ghi nhận rõ ràng các phạm vi có sự hỗ trợ của các mô hình AI ngôn ngữ lớn (LLM).

---

## 2. PHẠM VI ỨNG DỤNG AI CỤ THỂ

### A. Thiết Kế Kiến Trúc & Tư Vấn Cấu Trúc Dữ Liệu
- **Hệ thống Sổ Cái (Completion Ledger):** Nhóm đã thảo luận cùng AI để lựa chọn giải pháp Event Sourcing thu nhỏ, thay vì lưu trữ các trường tích lũy phân tán. Điều này giúp ngăn chặn hoàn toàn lỗi cộng dồn trùng lặp XP khi người dùng click liên tục hoặc chuyển tab.
- **Mô hình Dữ Liệu Type-Safe:** AI hỗ trợ sinh các TypeScript interface chuẩn xác (`CompletionEntry`, `QuestPackageDef`, `CosmeticDef`, `GameState`), giúp dự án đạt tiêu chuẩn TypeScript Strict không dùng `any`.

### B. Hỗ Trợ Sinh Mã Nguồn (Code Generation)
- **Thuật Toán Streak & Ngày Local:** AI hỗ trợ hoàn thiện hàm tính toán chuỗi ngày liên tiếp an toàn múi giờ UTC+7, kiểm soát việc chuyển ngày qua nửa đêm lúc 00:00.
- **Hệ Thống Script Tự Động:** AI hỗ trợ viết các Node.js ESM script (`scripts/import-characters.mjs`, `scripts/check-characters.mjs`, `scripts/import-gear.mjs`, `scripts/make-qr.mjs`) phục vụ việc tự động hóa quá trình nhập và kiểm tra tài nguyên.

### C. Xây Dựng Ngân Hàng Câu Hỏi Ôn Tập (Exam Bank)
- Nhóm đã yêu cầu AI hỗ trợ biên soạn ngân hàng 75 câu hỏi trắc nghiệm (15 câu cho mỗi kỳ thi trong 5 kỳ thi) thuộc các môn:
  1. Python Cơ Bản & Cấu Trúc Dữ Liệu
  2. Giải Tích & Toán Cao Cấp
  3. Toán Rời Rạc & Logic
  4. Nhập Môn Trí Tuệ Nhân Tạo
  5. Kỹ Năng Học Đại Học & Quản Lý Thời Gian
- Mỗi câu hỏi đều được cung cấp 4 đáp án lựa chọn, 1 đáp án đúng duy nhất và phần giải thích ngắn gọn, súc tích. Các thành viên trong nhóm đã rà soát lại từng câu để đảm bảo tính chuẩn xác học thuật.

### D. Kiểm Thử Tự Động (Unit Testing)
- AI đã hỗ trợ thiết lập kịch bản kiểm thử toàn diện trên `node:test` và `tsx` (`src/domain/domain.test.ts`), bao gồm:
  - Kiểm thử công thức thăng cấp Level `50 * L * (L - 1)`.
  - Kiểm thử cơ chế khóa chống trùng lặp nhận XP.
  - Kiểm thử logic tính Streak qua các ngày liên tiếp và khi ngắt quãng.
  - Kiểm thử giỏ hàng, mã giảm giá và mở khóa Boss Quest.

---

## 3. BÀI HỌC KINH NGHIỆM KHI LÀM VIỆC VỚI AI
- Cần cung cấp ngữ cảnh rõ ràng và ràng buộc cụ thể (ví dụ: quy định chặt chẽ về múi giờ UTC+7, không sử dụng `any`, giao diện mobile-first 390×844) để tránh việc AI sinh mã không phù hợp với mục tiêu dự án.
- Tự động hóa quá trình kiểm thử (`npm test` và `npm run build`) là chốt chặn quan trọng nhất để phát hiện kịp thời các lỗi biên dịch hoặc lỗi logic phát sinh.
