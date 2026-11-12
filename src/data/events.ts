import { DifficultyLevel, XP_BY_DIFFICULTY } from '../config/progression.js';

export interface EventTaskDef {
  id: string;
  name: string;
  description: string;
  condition: string;
  difficulty: DifficultyLevel;
  xp: number;
  locationId: string;
}

export interface SeasonEventDef {
  id: string;
  title: string;
  description: string;
  scheduleType: 'relative' | 'weekly' | 'monthly' | 'window';
  accentColor: string;
  clearBonusXp: number;
  rewardCosmeticId?: string;
  tasks: EventTaskDef[];
  // Evaluates whether the event is active for given date and user createdAt
  isActive: (now: Date, userCreatedAt: string) => { active: boolean; occurrenceKey: string; daysRemaining: number };
}

export const CAMPUS_EVENTS: SeasonEventDef[] = [
  {
    id: 'ev-welcome-week',
    title: 'Tuần Lễ Tân Binh (Welcome Week)',
    description: '7 ngày đầu tiên trải nghiệm app: Làm quen với nhịp sinh hoạt và khám phá toàn bộ campus!',
    scheduleType: 'relative',
    accentColor: '#38BDF8',
    clearBonusXp: 150,
    rewardCosmeticId: 'fr-rune-violet',
    tasks: [
      {
        id: 'ww-01',
        name: 'Thám Hiểm Campus',
        description: 'Mở trang Bản đồ Campus và ghé thăm ít nhất một địa điểm học tập.',
        condition: 'Bấm chọn một địa điểm trên bản đồ khuôn viên trường.',
        difficulty: 'Easy',
        xp: XP_BY_DIFFICULTY.Easy,
        locationId: 'event-hall',
      },
      {
        id: 'ww-02',
        name: 'Daily Tân Binh',
        description: 'Hoàn thành nhiệm vụ Daily Quest bất kỳ đầu tiên trong tuần lễ nhập môn.',
        condition: 'Đánh dấu hoàn thành 1 Daily Quest hôm nay.',
        difficulty: 'Easy',
        xp: XP_BY_DIFFICULTY.Easy,
        locationId: 'classroom',
      },
      {
        id: 'ww-03',
        name: 'Trang Bị Đầu Tiên',
        description: 'Ghé thăm Tủ đồ và mặc một món trang bị hoặc sân khấu cho nhân vật.',
        condition: 'Trang bị 1 món bất kỳ trong tủ đồ cá nhân.',
        difficulty: 'Easy',
        xp: XP_BY_DIFFICULTY.Easy,
        locationId: 'dorm',
      },
    ],
    isActive: (now: Date, userCreatedAt: string) => {
      const created = new Date(userCreatedAt);
      const diffMs = now.getTime() - created.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const active = diffDays >= 0 && diffDays < 7;
      const daysRemaining = Math.max(0, 7 - diffDays);
      const startKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}-${String(created.getDate()).padStart(2, '0')}`;
      return { active, occurrenceKey: `welcome-${startKey}`, daysRemaining };
    },
  },
  {
    id: 'ev-weekend-boss',
    title: 'Đại Chiến Cuối Tuần (Weekend Boss)',
    description: 'Thứ Bảy & Chủ Nhật: Rà soát bài vở, nạp lại năng lượng và dọn dẹp không gian sống.',
    scheduleType: 'weekly',
    accentColor: '#F59E0B',
    clearBonusXp: 100,
    tasks: [
      {
        id: 'wb-01',
        name: 'Dọn Dẹp Căn Cứ',
        description: 'Lau dọn góc học tập, giặt giũ đồ đạc chuẩn bị sẵn sàng cho tuần học mới.',
        condition: 'Dọn sạch bàn học và gấp gọn đồ cá nhân.',
        difficulty: 'Easy',
        xp: XP_BY_DIFFICULTY.Easy,
        locationId: 'dorm',
      },
      {
        id: 'wb-02',
        name: 'Tổng Kết Tuần',
        description: 'Kiểm tra lại toàn bộ bài tập và ghi chú đã học trong 5 ngày vừa qua.',
        condition: 'Rà soát danh sách bài tập của tuần và chuẩn bị bài tuần tới.',
        difficulty: 'Normal',
        xp: XP_BY_DIFFICULTY.Normal,
        locationId: 'library',
      },
      {
        id: 'wb-03',
        name: 'Vận Động Ngoài Trời',
        description: 'Tận hưởng ngày nghỉ cuối tuần với ít nhất 30 phút hoạt động ngoài trời.',
        condition: 'Đi dạo, chơi thể thao hoặc gặp bạn bè vào cuối tuần.',
        difficulty: 'Normal',
        xp: XP_BY_DIFFICULTY.Normal,
        locationId: 'park',
      },
    ],
    isActive: (now: Date) => {
      const day = now.getDay(); // 0 is Sunday, 6 is Saturday
      const isWeekend = day === 0 || day === 6;
      // Get the Saturday of this week as key
      const d = new Date(now);
      const offsetToSaturday = day === 0 ? -1 : 0;
      d.setDate(d.getDate() + offsetToSaturday);
      const satKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const daysRemaining = day === 6 ? 2 : 1;
      return { active: isWeekend, occurrenceKey: `sat-${satKey}`, daysRemaining };
    },
  },
  {
    id: 'ev-study-marathon',
    title: 'Marathon Giữa Tuần (Midweek Grind)',
    description: 'Thứ Hai đến Thứ Tư: Giữ vững nhịp độ học tập ngay từ đầu tuần.',
    scheduleType: 'weekly',
    accentColor: '#8B5CF6',
    clearBonusXp: 120,
    tasks: [
      {
        id: 'sm-01',
        name: 'Khởi Động Thứ Hai',
        description: 'Lên lịch đầy đủ các buổi học và deadline trong tuần mới.',
        condition: 'Xem trước thời khóa biểu tuần.',
        difficulty: 'Easy',
        xp: XP_BY_DIFFICULTY.Easy,
        locationId: 'study-hub',
      },
      {
        id: 'sm-02',
        name: 'Phiên Học Sâu 45 Phút',
        description: 'Thực hiện ít nhất 1 phiên học sâu không xao nhãng tại thư viện hoặc phòng học.',
        condition: 'Tập trung học liên tục 45 phút.',
        difficulty: 'Normal',
        xp: XP_BY_DIFFICULTY.Normal,
        locationId: 'library',
      },
      {
        id: 'sm-03',
        name: 'Ghi Chép Bài Giảng',
        description: 'Tổng hợp lại công thức hoặc mã nguồn đã học trong các tiết sáng.',
        condition: 'Ghi chép xong tóm tắt 1 bài giảng.',
        difficulty: 'Normal',
        xp: XP_BY_DIFFICULTY.Normal,
        locationId: 'classroom',
      },
    ],
    isActive: (now: Date) => {
      const day = now.getDay(); // 1 = Mon, 2 = Tue, 3 = Wed
      const active = day >= 1 && day <= 3;
      // occurrence is Monday of the week
      const d = new Date(now);
      const diffToMon = day === 0 ? -6 : 1 - day;
      d.setDate(d.getDate() + diffToMon);
      const monKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const daysRemaining = Math.max(1, 4 - (day === 0 ? 7 : day));
      return { active, occurrenceKey: `marathon-${monKey}`, daysRemaining };
    },
  },
  {
    id: 'ev-deadline-week',
    title: 'Tuần Lễ Tiêu Diệt Deadline',
    description: '7 ngày cuối tháng: Dồn sức hoàn tất mọi bài tập lớn và dự án môn học trước khi sang tháng mới!',
    scheduleType: 'monthly',
    accentColor: '#EF4444',
    clearBonusXp: 200,
    tasks: [
      {
        id: 'dw-01',
        name: 'Rà Soát Deadline Cuối Tháng',
        description: 'Kiểm tra toàn bộ cổng nộp bài xem còn bài tập nào chưa nộp hay không.',
        condition: 'Lập danh mục bài cần nộp trước khi hết tháng.',
        difficulty: 'Easy',
        xp: XP_BY_DIFFICULTY.Easy,
        locationId: 'study-hub',
      },
      {
        id: 'dw-02',
        name: 'Tiêu Diệt Báo Cáo',
        description: 'Hoàn thiện bản nháp báo cáo hoặc mã nguồn đồ án môn học.',
        condition: 'Nộp ít nhất 1 bài tập quan trọng.',
        difficulty: 'Hard',
        xp: XP_BY_DIFFICULTY.Hard,
        locationId: 'computer-lab',
      },
      {
        id: 'dw-03',
        name: 'Kiểm Tra Trùng Lặp & Format',
        description: 'Kiểm tra lỗi chính tả, định dạng tài liệu chuẩn học thuật trước khi xuất PDF.',
        condition: 'Chỉnh sửa định dạng bài báo cáo hoàn chỉnh.',
        difficulty: 'Normal',
        xp: XP_BY_DIFFICULTY.Normal,
        locationId: 'library',
      },
    ],
    isActive: (now: Date) => {
      const year = now.getFullYear();
      const month = now.getMonth();
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      const currentDay = now.getDate();
      const active = currentDay > lastDayOfMonth - 7;
      const daysRemaining = Math.max(1, lastDayOfMonth - currentDay + 1);
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      return { active, occurrenceKey: `dl-week-${monthKey}`, daysRemaining };
    },
  },
  {
    id: 'ev-new-month',
    title: 'Khởi Đầu Mới (New Month New Me)',
    description: '3 ngày đầu mỗi tháng: Đặt mục tiêu mới, làm mới tinh thần và thiết lập kỷ luật.',
    scheduleType: 'monthly',
    accentColor: '#10B981',
    clearBonusXp: 120,
    tasks: [
      {
        id: 'nm-01',
        name: 'Bảng Mục Tiêu Tháng',
        description: 'Viết ra 3 mục tiêu lớn bạn muốn đạt được trong tháng này (điểm số, sức khỏe, kỹ năng).',
        condition: 'Xác định 3 mục tiêu trọng tâm của tháng mới.',
        difficulty: 'Easy',
        xp: XP_BY_DIFFICULTY.Easy,
        locationId: 'club-stage',
      },
      {
        id: 'nm-02',
        name: 'Làm Mới Không Gian',
        description: 'Thay đổi hình nền máy tính, sắp xếp lại bàn học cho tháng mới đầy hứng khởi.',
        condition: 'Tạo cảm hứng mới mẻ cho không gian học tập.',
        difficulty: 'Easy',
        xp: XP_BY_DIFFICULTY.Easy,
        locationId: 'dorm',
      },
      {
        id: 'nm-03',
        name: 'Khởi Động Streak Mới',
        description: 'Hoàn thành trọn vẹn chuỗi Daily Quest ngày đầu tháng để lấy đà bứt phá.',
        condition: 'Hoàn thành ít nhất 3 Daily Quests trong ngày.',
        difficulty: 'Normal',
        xp: XP_BY_DIFFICULTY.Normal,
        locationId: 'classroom',
      },
    ],
    isActive: (now: Date) => {
      const currentDay = now.getDate();
      const active = currentDay <= 3;
      const daysRemaining = Math.max(1, 4 - currentDay);
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return { active, occurrenceKey: `newmonth-${monthKey}`, daysRemaining };
    },
  },
  {
    id: 'ev-campus-festival',
    title: 'Lễ Hội Sinh Viên (Campus Festival)',
    description: 'Từ ngày 12 đến 16 hằng tháng: Tham gia các hoạt động ngoại khóa, câu lạc bộ và giao lưu bạn bè.',
    scheduleType: 'monthly',
    accentColor: '#EC4899',
    clearBonusXp: 150,
    tasks: [
      {
        id: 'cf-01',
        name: 'Ghé Thăm Sân Khấu CLB',
        description: 'Tìm hiểu thông tin hoặc xem một tiết mục/hoạt động của câu lạc bộ sinh viên.',
        condition: 'Tham gia một buổi giao lưu CLB.',
        difficulty: 'Easy',
        xp: XP_BY_DIFFICULTY.Easy,
        locationId: 'club-stage',
      },
      {
        id: 'cf-02',
        name: 'Ảnh Kỷ Niệm Bạn Bè',
        description: 'Gặp gỡ và trò chuyện ngoài đời thực cùng nhóm bạn thân.',
        condition: 'Lưu giữ một khoảnh khắc đẹp cùng bạn bè campus.',
        difficulty: 'Normal',
        xp: XP_BY_DIFFICULTY.Normal,
        locationId: 'park',
      },
      {
        id: 'cf-03',
        name: 'Học Hỏi Kỹ Năng Mới',
        description: 'Tham dự một workshop hoặc buổi chia sẻ kỹ năng mềm.',
        condition: 'Tham gia buổi sinh hoạt kỹ năng của trường.',
        difficulty: 'Normal',
        xp: XP_BY_DIFFICULTY.Normal,
        locationId: 'event-hall',
      },
    ],
    isActive: (now: Date) => {
      const currentDay = now.getDate();
      const active = currentDay >= 12 && currentDay <= 16;
      const daysRemaining = Math.max(1, 17 - currentDay);
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return { active, occurrenceKey: `fest-${monthKey}`, daysRemaining };
    },
  },
];
