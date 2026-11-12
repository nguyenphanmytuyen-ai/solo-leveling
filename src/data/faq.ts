export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_LIST: FaqItem[] = [
  {
    question: 'Thanh toán mở khóa Quest Packages có phải là tiền thật không?',
    answer: 'Hoàn toàn KHÔNG. Mọi giao dịch tại Giỏ hàng và Checkout đều là phiên bản MÔ PHỎNG DEMO nhằm phục vụ trải nghiệm người dùng. Ứng dụng không thu tiền, không yêu cầu thẻ ngân hàng thật, không có cổng thanh toán thật.',
  },
  {
    question: 'Dữ liệu làm nhiệm vụ, level và streak của tôi được lưu ở đâu?',
    answer: 'Toàn bộ dữ liệu của bạn được lưu trữ an toàn ngay trên trình duyệt máy của bạn (thông qua localStorage và IndexedDB cho ảnh đồ tự tạo). Ứng dụng không có backend máy chủ trung gian, không thu thập thông tin cá nhân và không yêu cầu đăng nhập tài khoản.',
  },
  {
    question: 'XP trong game được tính như thế nào? Có thể tự nhập XP không?',
    answer: 'XP được hệ thống tự động tính toán từ Sổ Cái Hoàn Thành (Completion Ledger) dựa trên bảng độ khó cố định: Easy (10 XP), Normal (25 XP), Hard (50 XP), Boss (100 XP) và điểm thưởng hoàn thành gói. Người dùng không thể tự nhập hay chỉnh sửa XP để đảm bảo tính công bằng và cảm giác thành tựu.',
  },
  {
    question: 'Daily Quests được làm mới khi nào? Nếu quên 1 ngày thì sao?',
    answer: 'Daily Quests tự động làm mới vào đúng 00:00 nửa đêm theo giờ máy của bạn. Nếu sang ngày mới mà bạn chưa hoàn thành, các nhiệm vụ ngày cũ sẽ đóng lại mà không bị trừ XP. Tuy nhiên để giữ vững chuỗi Streak, bạn chỉ cần hoàn thành ít nhất 1 Daily Quest mỗi ngày.',
  },
  {
    question: 'Tôi có thể thay đổi nhân vật hoặc thêm ảnh trang phục riêng của mình không?',
    answer: 'Có! Bạn có thể đổi nhân vật bất kỳ lúc nào tại mục Hồ sơ -> Cài đặt. Ngoài ra, trong Tủ đồ có mục "Đồ của bạn" cho phép tải ảnh trang phục riêng (GIF, WebP, PNG) và căn chỉnh trực tiếp trên nhân vật.',
  },
  {
    question: 'Ngoại trang và trang phục trong Tủ đồ có tăng chỉ số hay XP không?',
    answer: 'Không. Ngoại trang và trang phục trong SOLO LEVELLING thuần túy mang tính thẩm mỹ và thể hiện phong cách của bạn. Ngoại trang không bán bằng tiền hay XP, chỉ có thể mở khóa bằng nỗ lực thật: tăng level, đạt chuỗi streak và vượt qua các thử thách.',
  },
];
