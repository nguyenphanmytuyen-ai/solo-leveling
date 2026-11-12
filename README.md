# SOLO LEVELLING — READY TO BECOME BETTER?

> **Web App To-Do RPG Dành Cho Sinh Viên Đại Học**  
> Biến việc học, thói quen và đồ án đại học thành những chuỗi nhiệm vụ RPG kịch tính. Nhận XP, lên cấp, duy trì streak và mở khóa ngoại trang độc bản!

---

## 1. GIỚI THIỆU DỰ ÁN

**SOLO LEVELLING** là nền tảng quản lý mục tiêu học tập và phát triển cá nhân theo phong cách game nhập vai (RPG Gamification). Người dùng vào vai một sinh viên đang từng ngày "thăng cấp" cuộc sống:
- **7 Daily Quests mặc định:** Mở lại vào đúng 00:00 hằng ngày giúp duy trì nhịp độ sinh hoạt và học tập (Pomodoro 25 phút, uống nước, dọn bàn, vận động nhẹ, nhìn lại ngày...).
- **7 Quest Packages chuyên sâu:** Các chuỗi nhiệm vụ có cấu trúc (Master Python, Gym Rat, Nerd Mode, AI HCMUS-ER, Touch Grass, Main Character Arc, Deadline Survivor). Nhiệm vụ đầu tiên của mỗi gói luôn được chơi thử MIỄN PHÍ.
- **Campus Map (Bản đồ trường học):** 9 địa điểm trực quan tương ứng với các lĩnh vực, tích lũy độ thân quen từng khu vực và gợi ý "Hot spot" hằng ngày.
- **Exam Arena (Đấu trường thi cử):** 5 kỳ thi ôn tập trắc nghiệm nền tảng dưới dạng màn đấu Boss kịch tính với thanh máu Boss, hệ thống 4 tim người chơi và thời gian 30 giây/câu.
- **Tủ đồ & Trang bị (Gear & Cosmetics):** 8 slot trang phục mặc lên người nhân vật + 6 slot sân khấu. Thuần thẩm mỹ, không bán bằng tiền hay XP, chỉ mở khóa qua nỗ lực học tập thực tế.
- **Không backend, không đăng nhập:** Toàn bộ dữ liệu lưu trữ trực tiếp trên trình duyệt thiết bị (localStorage + IndexedDB), bảo mật và an toàn.

---

## 2. QUYẾT ĐỊNH THIẾT KẾ CỐT LÕI

1. **Một nguồn sự thật duy nhất (Single Source of Truth):** Toàn bộ dữ liệu XP, level, streak, tiến độ gói và thành tựu đều được tính toán từ **Sổ Cái Hoàn Thành (`completions[]`)** và danh sách đơn hàng demo. Không lưu các con số này thành các trường phân tán, tránh hoàn toàn lỗi lệch dữ liệu.
2. **Cơ chế khóa chống nhận trùng lặp XP (Dedup Keys):**
   - Daily Quest: `${questId}@${YYYY-MM-DD}` (ngày local).
   - Nhiệm vụ gói: `${taskId}`.
   - Thưởng hoàn tất gói: `clear:${packageId}`.
   - Nhiệm vụ sự kiện: `${eventId}@${occurrenceKey}:${taskId}`.
   - Vượt qua kỳ thi: `exam:${examId}:pass`.  
   Nếu khóa đã có trong sổ cái, thao tác hoàn thành lập tức là `no-op` (không cộng XP, không đẩy thông báo), chặn đứng tình trạng spam click hay mở 2 tab.
3. **Múi giờ Local chuẩn xác:** Tuyệt đối không dùng `toISOString().slice(0, 10)` vì sẽ gây lệch ngày ở múi giờ UTC+7 vào sáng sớm. Toàn bộ hàm tính ngày đều dùng `getFullYear()`, `getMonth() + 1`, `getDate()` của thiết bị.
4. **Thanh toán hoàn toàn là bản Demo:** Cung cấp trải nghiệm giỏ hàng, mã giảm giá (`LEVELUP10`, `FRESHMAN`) và thanh toán mô phỏng (Test Card, Demo Wallet, Demo Bank Transfer). Không thu bất kỳ khoản tiền thật nào.
5. **Nhân vật dự phòng (SVG Placeholders):** Mặc định app cung cấp sẵn 2 nhân vật SVG nguyên bản (`hero` và `scholar`) đạt chuẩn hoạt họa `idle` và `reward` để hệ thống luôn khởi chạy ổn định kể cả khi chưa có file nén nhân vật bên ngoài.

---

## 3. CÀI ĐẶT & CHẠY LOCAL

Yêu cầu môi trường: **Node.js 18+** (khuyến nghị Node 22).

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Chạy ứng dụng ở môi trường phát triển (Port 3000)
npm run dev

# 3. Chạy toàn bộ bộ kiểm thử tự động (Unit Tests)
npm test

# 4. Kiểm tra tính toàn vẹn của nhân vật và trang bị
npm run chars:check
npm run gear:check

# 5. Đóng gói bản Production
npm run build

# 6. Xem trước bản đóng gói
npm run preview

# 7. Tạo mã QR truy cập trang web
npm run qr -- https://solo-levelling.app
```

---

## 4. DÙNG BỘ NHÂN VẬT CỦA BẠN (TÙY BIẾN KHÔNG CẦN SỬA CODE)

Bạn có thể thay thế bộ nhân vật mặc định bằng bộ nhân vật do chính bạn vẽ hoặc sưu tầm mà **không cần chỉnh sửa mã nguồn**.

### 1. Chuẩn bị ảnh
- Mỗi nhân vật có tối đa hai trạng thái:
  - `main` (hoặc `idle`): Ảnh đứng chờ, lặp liên tục, **bắt buộc**.
  - `get_star` (hoặc `reward`, `star`, `happy`, `cheer`): Ảnh ăn mừng chiến thắng khi xong nhiệm vụ (chạy khoảng 5 giây), **tùy chọn**.
- **Định dạng nhận:** GIF, WebP động, APNG/PNG (PNG tĩnh vẫn dùng được cho `main`).
- Khuyến nghị: Cạnh dài 128–512px, mỗi file dưới 1.5 MB, nền trong suốt (transparent) để không che cảnh nền của ngoại trang sân khấu. Các nhân vật nên có cùng tỉ lệ khung để đổi nhân vật không bị nhảy bố cục.

### 2. Cấu trúc file zip hoặc thư mục
Hệ thống script tự động nhận diện cả hai cách đặt tên:

**Cách 1: Theo thư mục con**
```text
char.zip (hoặc thư mục my_chars/)
├── hero/
│   ├── main.gif        (bắt buộc)
│   └── get_star.gif    (tùy chọn)
└── mage/
    ├── main.gif
    └── get_star.gif
```

**Cách 2: Đặt tên file phẳng**
```text
char.zip
├── hero_main.gif
├── hero_get_star.gif
├── mage_main.gif
└── mage_get_star.gif
```
*(Các thư mục rác như `__MACOSX`, `.DS_Store`, `Thumbs.db` và thư mục bọc ngoài 1 cấp sẽ tự động được bỏ qua).*

### 3. Lệnh nhập và kiểm tra
```bash
# Nhập từ file zip hoặc thư mục
npm run chars:import -- ./char.zip

# Hoặc nếu đã giải nén ra thư mục:
npm run chars:import -- ./my_characters_folder

# Chạy kiểm tra tính toàn vẹn (tự động chạy trước mỗi lần build)
npm run chars:check
```

### 4. Tinh chỉnh `src/data/characters.json`
Sau khi nhập, thông tin nhân vật được lưu tại `src/data/characters.json`:
- `id`: Mã định danh duy nhất (chữ thường, số, gạch ngang).
- `displayName`: Tên hiển thị (VD: "Chiến Binh Rồng").
- `tagline`: Câu khẩu hiệu ngắn dưới tên.
- `idle`: Đường dẫn ảnh chờ, kích thước width/height.
- `reward`: Đường dẫn ảnh ăn mừng và `durationMs` (mặc định 5000 = 5 giây).
- `pixelArt`: Đặt `true` nếu là tranh pixel để bật `image-rendering: pixelated`.
- `stage.scale`: Tỉ lệ phóng to/thu nhỏ trên sân khấu (0.6 - 1.0, mặc định 0.8).
- `stage.offsetY`: Độ lệch dọc tính theo % để căn chỉnh chân nhân vật chạm đáy sân khấu.

### 5. Bảng xử lý lỗi thường gặp về nhân vật

| Triệu chứng | Nguyên nhân thường gặp | Cách sửa |
| :--- | :--- | :--- |
| **Ảnh vỡ sau khi deploy** | Sai chữ hoa/thường trong tên file (host Linux phân biệt hoa thường) | Đổi toàn bộ tên file thành chữ thường và chạy lại `chars:check` |
| **`chars:import` báo thiếu `main`** | Tên file đặt sai cú pháp hoặc thư mục lồng quá sâu | Đặt lại tên là `main.gif` hoặc `hero_main.gif` theo đúng mục 2 |
| **Không thấy ăn mừng khi xong quest** | Nhân vật chưa có file `get_star` | Thêm file `get_star` (nếu không có, app sẽ tự động dùng hiệu ứng nhảy nhẹ + hào quang CSS thay thế) |
| **Ảnh pixel bị mờ** | Thuộc tính `pixelArt` đang tắt (`false`) | Mở `characters.json` và chỉnh `"pixelArt": true` |
| **Nhân vật bị che bởi khung viền** | Kích thước ảnh quá lớn so với sân khấu | Giảm `stage.scale` xuống `0.7` hoặc chỉnh lại `stage.offsetY` |
| **Có nền đen/trắng đè lên cảnh nền** | Ảnh xuất ra chưa bật nền trong suốt (alpha) | Xuất lại ảnh với kênh nền Transparent |
| **`npm run build` dừng ở bước kiểm tra** | `chars:check` phát hiện lỗi thiếu file hoặc file hỏng | Đọc chi tiết lỗi báo trong terminal và bổ sung file tương ứng |

---

## 5. THÊM ĐỒ TRANG BỊ CỦA BẠN (GEAR & CUSTOM UPLOADS)

### Đường A: Thêm trang bị chính thức qua thư mục
Đặt ảnh trang phục vào thư mục `public/assets/gear/<slot>/<itemId>/` (slot gồm: `head`, `face`, `body`, `legs`, `feet`, `back`, `handheld`, `accessory`):
```text
public/assets/gear/head/witch_hat/
├── all.png             (hoặc all.gif - dùng cho mọi nhân vật)
└── meta.json           (tên, mô tả, độ hiếm, luật mở khóa)
```
Sau đó chạy:
```bash
npm run gear:import
npm run gear:check
```

### Đường B: Tải lên trực tiếp ngay trong ứng dụng
1. Mở trang **Tủ Đồ** (`/play/wardrobe`) -> Chọn tab **"Đồ của bạn"**.
2. Bấm nút **"Thêm đồ của bạn"**.
3. Chọn file ảnh (GIF, WebP, PNG dưới 2MB), đặt tên món đồ và chọn slot (mũ, áo, quần, kính...).
4. Sử dụng bảng điều khiển thời gian thực: thanh trượt tọa độ X, Y, Scale và nút lật ngang để căn chỉnh vừa vặn lên nhân vật của bạn.
5. Bấm **"Lưu Vào Tủ Đồ"**. Món đồ được lưu an toàn trong IndexedDB của trình duyệt máy bạn.

---

## 6. HƯỚNG DẪN TRIỂN KHAI (DEPLOYMENT)

Ứng dụng được cấu hình sẵn chế độ đường dẫn tương đối (`base: './'`) kết hợp `HashRouter` nên có thể deploy lên bất kỳ dịch vụ hosting tĩnh nào mà không lo lỗi 404 khi tải lại trang:

### Triển khai lên Vercel
1. Đẩy code lên GitHub repository.
2. Truy cập Vercel Dashboard -> Chọn **Add New Project** -> Chọn repo vừa đẩy.
3. Vercel tự động nhận diện `vite build` và file `vercel.json`. Bấm **Deploy**.

### Triển khai lên Netlify
1. Kéo thả thư mục `dist` vào Netlify Drop hoặc liên kết Git repository.
2. Build command: `npm run build`. Publish directory: `dist`.
3. File `public/_redirects` đã có sẵn để điều hướng URL chuẩn xác.

### Triển khai lên GitHub Pages
1. Trong `package.json`, thêm `"homepage": "https://<username>.github.io/<repo-name>"`.
2. Chạy lệnh: `npm run build`.
3. Đẩy toàn bộ nội dung thư mục `dist` lên nhánh `gh-pages`.

---

## 7. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
solo-levelling/
├── public/
│   ├── assets/
│   │   ├── char/         # Thư mục ảnh nhân vật (main & get_star)
│   │   └── gear/         # Thư mục trang phục RPG 8 slot
│   ├── favicon.svg       # Biểu tượng thương hiệu RPG
│   └── _redirects        # Cấu hình routing Netlify
├── scripts/
│   ├── import-characters.mjs # Script tự động giải nén và nhập nhân vật
│   ├── check-characters.mjs  # Script kiểm tra tính toàn vẹn nhân vật
│   ├── import-gear.mjs        # Script quét trang phục chính thức
│   ├── check-gear.mjs         # Script kiểm tra manifest trang phục
│   └── make-qr.mjs            # Script sinh mã QR tĩnh
├── docs/
│   ├── poster-content.md # Nội dung chi tiết cho poster khổ A1
│   ├── pitch-and-qa.md   # Kịch bản thuyết trình 2 phút & 15 câu Q&A
│   └── ai-usage.md       # Báo cáo việc ứng dụng AI trong dự án
├── src/
│   ├── config/           # brand.ts, progression.ts (công thức level)
│   ├── data/             # copy, dailyQuests, questPackages, achievements, cosmetics, exams...
│   ├── domain/           # Logic nghiệp vụ thuần TypeScript (dates, streak, quests, cart...)
│   ├── store/            # GameContext, reducer, persistence (localStorage), indexedDb, selectors
│   ├── components/       # UI primitives, CharacterStage, CharacterSprite, QuestCard...
│   ├── pages/            # Landing, Dashboard, Quests, Map, Events, Wardrobe, Cart...
│   ├── App.tsx           # Router & code-splitting
│   └── main.tsx          # Điểm khởi chạy React
├── vercel.json
├── package.json
└── README.md
```

---

## 8. BẢN QUYỀN & LƯU Ý
- Mọi hình ảnh logo, huy hiệu, giao diện, bảng màu và câu hỏi trắc nghiệm đều là sản phẩm tự tạo nguyên bản của nhóm phát triển.
- Các nhân vật mẫu dự phòng (`hero`, `scholar`) được vẽ bằng SVG nguyên bản, không sao chép từ bất kỳ tác phẩm thương mại nào.
- Ứng dụng tôn trọng tối đa quyền riêng tư của sinh viên: không gửi dữ liệu ra bên ngoài, không gắn mã theo dõi (telemetry) hay quảng cáo.
