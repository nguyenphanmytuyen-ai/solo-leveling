import { DifficultyLevel, XP_BY_DIFFICULTY } from '../config/progression.js';

export interface DailyQuestDef {
  id: string;
  name: string;
  category: 'Daily Life' | 'Academic' | 'Health' | 'Personal Growth';
  difficulty: DifficultyLevel;
  xp: number;
  condition: string;
  description: string;
  locationId: string;
}

export const DAILY_QUESTS: DailyQuestDef[] = [
  {
    id: 'daily-morning-spawn',
    name: 'Morning Spawn',
    category: 'Daily Life',
    difficulty: 'Easy',
    xp: XP_BY_DIFFICULTY.Easy,
    condition: 'Mở kế hoạch hôm nay và chọn ít nhất một việc ưu tiên',
    description: 'Khởi động ngày mới với mục tiêu rõ ràng. Hãy chọn ra 1 việc quan trọng nhất bạn quyết tâm hoàn thành.',
    locationId: 'dorm',
  },
  {
    id: 'daily-academic-grind',
    name: 'Academic Grind',
    category: 'Academic',
    difficulty: 'Normal',
    xp: XP_BY_DIFFICULTY.Normal,
    condition: 'Học hoặc ôn bài tập trung khoảng 25 phút',
    description: 'Bật đồng hồ Pomodoro hoặc ngồi vào bàn học tập trung, không xao nhãng mạng xã hội trong 25 phút.',
    locationId: 'classroom',
  },
  {
    id: 'daily-knowledge-plus',
    name: 'Knowledge +1',
    category: 'Academic',
    difficulty: 'Normal',
    xp: XP_BY_DIFFICULTY.Normal,
    condition: 'Học một điều mới và tóm tắt lại bằng lời của mình',
    description: 'Một định lý mới, một thuật toán, một hàm thư viện hay một từ vựng tiếng Anh được ghi chép lại ngắn gọn.',
    locationId: 'library',
  },
  {
    id: 'daily-hydration-check',
    name: 'Hydration Check',
    category: 'Health',
    difficulty: 'Easy',
    xp: XP_BY_DIFFICULTY.Easy,
    condition: 'Đã đạt mục tiêu uống nước cá nhân (tự đặt, không ép con số)',
    description: 'Nạp đầy bình nước và uống đủ nước để giữ đầu óc luôn tỉnh táo suốt các tiết học kéo dài.',
    locationId: 'gym',
  },
  {
    id: 'daily-touch-grass',
    name: 'Touch Grass',
    category: 'Health',
    difficulty: 'Easy',
    xp: XP_BY_DIFFICULTY.Easy,
    condition: 'Vận động nhẹ hoặc ra ngoài ít nhất 10 phút nếu phù hợp',
    description: 'Tạm rời ghế ngồi, bước ra ngoài ban công hoặc đi dạo khuôn viên trường hít thở không khí tự nhiên.',
    locationId: 'park',
  },
  {
    id: 'daily-life-maintenance',
    name: 'Life Maintenance',
    category: 'Daily Life',
    difficulty: 'Easy',
    xp: XP_BY_DIFFICULTY.Easy,
    condition: 'Xong một việc sinh hoạt cá nhân (dọn bàn, giặt đồ, nấu ăn…)',
    description: 'Dọn dẹp góc học tập sạch sẽ, giặt một mẻ đồ hoặc chuẩn bị bữa ăn tươm tất.',
    locationId: 'dorm',
  },
  {
    id: 'daily-reflection',
    name: 'Daily Reflection',
    category: 'Personal Growth',
    difficulty: 'Normal',
    xp: XP_BY_DIFFICULTY.Normal,
    condition: 'Nhìn lại một điều mình đã làm được hôm nay',
    description: 'Dành 2 phút trước khi ngủ để ghi nhận một nỗ lực nhỏ bạn đã làm được trong ngày hôm nay.',
    locationId: 'club-stage',
  },
];
