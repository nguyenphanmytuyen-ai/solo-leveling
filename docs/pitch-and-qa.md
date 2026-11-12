# KỊCH BẢN THUYẾT TRÌNH (PITCH 2 PHÚT) & BỘ 15 CÂU HỎI - ĐÁP DỰ ÁN SOLO LEVELLING

---

## 1. KỊCH BẢN THUYẾT TRÌNH 2 PHÚT (ELEVATOR PITCH)

**[0:00 - 0:25] Đặt vấn đề**
> *"Kính chào quý thầy cô và các bạn. Là sinh viên đại học, có bao giờ bạn nhìn vào danh sách 5 bài tập lớn, 3 môn thi học kỳ và chỉ muốn đóng máy tính lại rồi nằm lướt TikTok? Chúng ta thường trì hoãn không phải vì lười biếng, mà vì não bộ không nhận được cảm giác tưởng thưởng tức thì sau 30 phút ngồi vào bàn học."*

**[0:25 - 1:00] Giới thiệu giải pháp**
> *"Đó là lý do nhóm chúng em xây dựng **SOLO LEVELLING: READY TO BECOME BETTER?** — một web app To-Do RPG gamification dành riêng cho sinh viên. Chúng em biến việc học đại học thành một trò chơi nhập vai nơi bạn là nhân vật chính. Thay vì 'phải học bài', bạn đang 'chinh phục nhiệm vụ Academic Grind'; thay vì 'làm bài tập lớn', bạn đang 'hạ gục Boss Dungeon Deadline Slayer'. Mỗi hành động hoàn thành đều mang lại XP thực tế, đẩy bạn lên cấp từ Tân Binh Giảng Đường đến Đấng Thượng Thừa Solo!"*

**[1:00 - 1:35] Tính năng đột phá & Công nghệ**
> *"Ứng dụng mang đến 7 Daily Quests hằng ngày, 7 gói nhiệm vụ chuyên sâu (như Master Python, Gym Rat, AI HCMUS-ER), Bản đồ Campus 9 khu vực trực quan và Đấu trường thi cử đấu Boss 30 giây. Về mặt kỹ thuật, hệ thống hoạt động dựa trên triết lý **Sổ cái Hoàn thành (Completion Ledger)** — một nguồn sự thật duy nhất (Single Source of Truth) kết hợp cơ chế khóa chống trùng lặp, bảo đảm người dùng không bao giờ nhận trùng XP kể cả khi bấm đúp hay mở nhiều tab. Mọi dữ liệu đều lưu cục bộ, chạy mượt mà trên mobile mà không cần tài khoản hay server trung gian."*

**[1:35 - 2:00] Kết luận & Kêu gọi hành động**
> *"Tại SOLO LEVELLING, mọi trang phục và huy hiệu đều thuần thẩm mỹ — chỉ mở khóa bằng nỗ lực học tập thực thụ, không bán bằng tiền. Chúng em mời mọi người hãy quét mã QR trên poster để cùng trải nghiệm và sẵn sàng thăng cấp bản thân ngay hôm nay! Em xin chân thành cảm ơn!"*

---

## 2. BỘ 15 CÂU HỎI - ĐÁP CHUYÊN SÂU (Q&A)

### Câu 1: Tại sao nhóm lại chọn kiến trúc Sổ Cái Hoàn Thành (Completion Ledger) thay vì lưu trực tiếp totalXp hay level vào state?
**Trả lời:** Lưu trực tiếp các con số tích lũy như totalXp hay level rất dễ dẫn đến sai lệch trạng thái (state drift) khi người dùng xóa tác vụ, làm lại bài thi, hoặc mở hai tab cùng lúc. Với Sổ cái Hoàn thành, `completions[]` là nguồn sự thật duy nhất. Total XP, level, streak, tiến độ gói và điều kiện mở khóa thành tựu đều là các hàm selector thuần túy (pure selectors) tính toán từ sổ cái. Nếu một bản ghi hợp lệ được thêm vào, mọi chỉ số tự động đồng bộ chính xác 100%.

### Câu 2: Làm thế nào ứng dụng chống nhận trùng lặp XP khi người dùng bấm đúp liên tục hoặc mở nhiều tab?
**Trả lời:** Mỗi hành động hoàn thành đều gắn với một khóa định danh duy nhất (dedup key):
- Daily Quest: `${questId}@${YYYY-MM-DD}` (theo ngày local).
- Nhiệm vụ gói: `${taskId}`.
- Thưởng hoàn tất gói: `clear:${packageId}`.
- Nhiệm vụ sự kiện: `${eventId}@${occurrenceKey}:${taskId}`.
- Vượt qua kỳ thi: `exam:${examId}:pass`.
Trước khi ghi nhận, reducer kiểm tra xem khóa này đã tồn tại trong `completions` chưa. Nếu đã có, thao tác hoàn thành lập tức trở thành một `no-op` (không cộng XP, không đẩy thông báo).

### Câu 3: Thuật toán tính Streak hoạt động thế nào? Nếu người dùng quên làm bài hôm nay thì chuỗi có bị mất ngay lập tức không?
**Trả lời:** Streak tính dựa trên danh sách các ngày local (YYYY-MM-DD) có ít nhất 1 Daily Quest hoàn thành. Nếu hôm nay người dùng chưa làm, nhưng hôm qua đã có lượt hoàn thành, streak vẫn được giữ nguyên vẹn cho đến hết 23:59:59 của ngày hôm nay. Chỉ khi bước qua ngày mới mà cả ngày hôm qua không có hoạt động nào thì chuỗi streak mới bị gián đoạn. Nhiều quest trong cùng 1 ngày cũng chỉ tính là 1 ngày streak.

### Câu 4: Vì sao nhóm nhấn mạnh việc dùng giờ Local thay vì toISOString().slice(0, 10)?
**Trả lời:** Hàm `toISOString()` trả về thời gian theo múi giờ UTC (GMT+0). Tại Việt Nam (UTC+7), từ 00:00 đến 06:59 sáng, ngày theo UTC vẫn là ngày hôm trước. Nếu dùng `toISOString().slice(0, 10)` để làm dateKey, sinh viên dậy sớm học bài lúc 6:00 sáng sẽ bị ghi nhận nhầm vào ngày hôm qua và mất chuỗi streak hôm nay! Do đó, ứng dụng bắt buộc dùng `getFullYear()`, `getMonth() + 1` và `getDate()` của máy để chuẩn xác theo ngày sinh hoạt thực tế của người dùng.

### Câu 5: Hệ thống thanh toán trong ứng dụng hoạt động như thế nào? Có thu tiền thật không?
**Trả lời:** Hoàn toàn là bản mô phỏng DEMO. Ứng dụng hiển thị giá VNĐ và quy trình Giỏ hàng -> Checkout để tạo trải nghiệm mua sắm chân thực và mô phỏng mô hình kinh doanh. Khi người dùng bấm "Xác nhận mở khóa", hệ thống chỉ tạo một bản ghi đơn hàng mẫu (Order Snapshot), mở khóa các gói tương ứng và lưu trên trình duyệt. Không thu bất kỳ thông tin thẻ tín dụng, mật khẩu hay tài khoản ngân hàng nào.

### Câu 6: Người dùng có thể tự tạo nhiệm vụ hoặc tự chỉnh sửa số XP của mình không?
**Trả lời:** Không. Để duy trì tính kỷ luật và giá trị của các mốc level trong game, người dùng không thể tự nhập nhiệm vụ hay tùy tiện chỉnh sửa XP. Toàn bộ nhiệm vụ trong hệ thống đều đi kèm tiêu chí hoàn thành khách quan và số XP cố định theo bảng độ khó (Easy: 10, Normal: 25, Hard: 50, Boss: 100).

### Câu 7: Khi người dùng "Rời gói nhiệm vụ" (Abandon Package), tiến độ và XP đã làm có bị mất không?
**Trả lời:** Không bị mất. Rời gói trong SOLO LEVELLING mang ý nghĩa "tạm dừng". Gói sẽ tạm ẩn khỏi mục Active Quests để người dùng tập trung vào việc khác, nhưng quyền sở hữu, tiến độ các bài đã làm, XP đã tích lũy và thành tựu đều được giữ nguyên vẹn trong sổ cái. Khi bấm "Tiếp tục gói", người dùng cày tiếp các nhiệm vụ còn lại mà không được nhận lại XP của các câu đã làm trước đó.

### Câu 8: Cơ chế "Chơi thử miễn phí" trong các Quest Packages được hiện thực ra sao?
**Trả lời:** Mỗi gói gồm một chuỗi các nhiệm vụ nối tiếp nhau và kết thúc bằng một Boss Quest. Nhiệm vụ đầu tiên (#01) của mọi gói luôn có cờ cho phép thực hiện tự do kể cả khi chưa mở khóa gói. Từ nhiệm vụ #02 trở đi, hệ thống kiểm tra quyền sở hữu gói. Với Boss Quest, hệ thống kiểm tra bổ sung điều kiện: toàn bộ các nhiệm vụ trước đó trong gói phải hoàn thành thì Boss mới mở cổng.

### Câu 9: Ngoại trang (Cosmetics) và Trang phục (Gear) có làm tăng chỉ số sức mạnh hay XP không?
**Trả lời:** Hoàn toàn KHÔNG. Mọi trang phục và ngoại trang trong SOLO LEVELLING đều thuần túy mang tính thẩm mỹ (cosmetics only), đúng chuẩn game RPG hiện đại. Chúng tôi muốn tôn vinh nỗ lực thật: không ai có thể mua được ngoại trang bằng tiền hay XP; người chơi chỉ có thể mặc được áo giáp xịn hay khung viền huyền thoại khi thực sự đạt được mốc Level cao, giữ chuỗi Streak dài hoặc vượt qua các Boss Dungeon.

### Câu 10: Làm thế nào ứng dụng bảo đảm hình ảnh động (GIF) của nhân vật và các lớp trang phục chạy đồng bộ với nhau?
**Trả lời:** Component `CharacterSprite` quản lý một phiên kết xuất với key đồng bộ. Khi đổi trang phục hoặc chuyển trạng thái ăn mừng, toàn bộ các lớp ảnh (nhân vật, mũ, áo, kính...) được khởi động lại cùng lúc kèm tham số cache-busting timestamp `?t=...`, bảo đảm các khung hình GIF chạy từ frame đầu tiên cùng nhau mà không bị lệch nhịp.

### Câu 11: Nếu người dùng tải ảnh trang phục cá nhân (Road B) lên ứng dụng, ảnh đó được lưu ở đâu?
**Trả lời:** Để tránh làm tràn bộ nhớ giới hạn 5MB của localStorage, ảnh tải lên (GIF, WebP, PNG) được chuyển thành binary blob và lưu trữ trong IndexedDB của trình duyệt (`SoloLevellingGearDB`). Chỉ có siêu dữ liệu (tên, slot, tọa độ căn chỉnh X, Y, scale) được lưu trong state. Nhờ vậy, người dùng có thể tải lên tới 30 món đồ cá nhân mượt mà.

### Câu 12: Đấu trường thi cử (Exam Arena) hoạt động theo nguyên lý nào để chống gian lận?
**Trả lời:** Khi bắt đầu thi, hệ thống rút ngẫu nhiên 10 câu hỏi từ ngân hàng đề và tính toán số tim dựa trên ngưỡng đạt: `Số tim = Số câu - Ngưỡng đạt + 1` (10 câu đạt 7 thì có 4 tim). Thời gian mỗi câu giới hạn 30 giây tính theo mốc thời gian tuyệt đối. Trả lời sai hoặc hết giờ trừ 1 tim, hết tim thì thua ngay. Điểm số chỉ được tính khi kết thúc phiên thi hợp lệ; nếu người dùng tải lại trang giữa chừng thì phiên thi bị hủy bỏ, tránh việc F5 để chọn lại đáp án.

### Câu 13: Ứng dụng đã được tối ưu hóa cho trải nghiệm di động (Mobile-first) như thế nào?
**Trả lời:** Mọi màn hình đều được thiết kế và kiểm thử chuẩn tỷ lệ màn hình điện thoại (390×844) trước tiên:
- Thanh điều hướng ngón cái (Bottom Nav) cố định có chừa `env(safe-area-inset-bottom)`.
- Tất cả các nút bấm chính (Hoàn thành, Thêm giỏ, Bắt đầu) đều có diện tích chạm tối thiểu 44×44px.
- Các bộ lọc chuyển đổi linh hoạt thành dạng Bottom-sheet vuốt trượt trên di động.
- Không có bất kỳ thành phần nào gây tràn ngang (horizontal overflow).

### Câu 14: Nhóm đã ứng dụng Trí tuệ Nhân tạo (AI) vào những khâu nào trong dự án?
**Trả lời:** Nhóm sử dụng AI như một trợ lý lập trình viên cấp cao: hỗ trợ sinh mã khung (boilerplate), tối ưu hóa thuật toán tính toán streak, xây dựng ngân hàng 75 câu hỏi trắc nghiệm kiểm chứng cho 5 kỳ thi ôn tập, và rà soát lỗi TypeScript nghiêm ngặt. Toàn bộ logic nghiệp vụ, kiến trúc Sổ cái và quyết định thiết kế sản phẩm đều do nhóm sinh viên trực tiếp định hình và kiểm soát chất lượng.

### Câu 15: Dự án có kế hoạch phát triển nào tiếp theo trong tương lai?
**Trả lời:** Nhóm định hướng 3 giai đoạn mở rộng:
1. Cho phép kết nối bạn bè cục bộ qua mã QR để xem hồ sơ và bảng xếp hạng danh hiệu sinh viên.
2. Bổ sung thêm các gói nhiệm vụ liên kết với đồ án thực tế của các khoa trong trường (Khoa Học Máy Tính, Công Nghệ Phần Mềm, Hệ Thống Thông Tin...).
3. Xuất bản thành Progressive Web App (PWA) để sinh viên có thể cài đặt trực tiếp lên màn hình chính điện thoại như ứng dụng native.
