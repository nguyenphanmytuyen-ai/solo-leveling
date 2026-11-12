import { CosmeticSlot } from '../store/types.js';

export type CosmeticRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export type CosmeticUnlockCondition =
  | { type: 'starter' }
  | { type: 'level'; level: number }
  | { type: 'achievement'; achievementId: string }
  | { type: 'packageClear'; packageId: string }
  | { type: 'streak'; days: number }
  | { type: 'locationMastery'; locationId: string; level: number };

export interface CosmeticDef {
  id: string;
  name: string;
  slot: CosmeticSlot;
  rarity: CosmeticRarity;
  unlock: CosmeticUnlockCondition;
  description: string;
  previewColor?: string;
  cssClass?: string;
  icon?: string;
}

export const COSMETICS: CosmeticDef[] = [
  // BACKDROPS (>= 6)
  {
    id: 'bd-starter-dorm',
    name: 'Phòng Ký Túc Xá Gọn Gàng',
    slot: 'backdrop',
    rarity: 'Common',
    unlock: { type: 'starter' },
    description: 'Căn phòng trọ thân thuộc nơi bắt đầu mọi giấc mơ thợ săn đại học.',
    previewColor: '#1E1B4B',
  },
  {
    id: 'bd-library-corner',
    name: 'Góc Thư Viện Cổ Kính',
    slot: 'backdrop',
    rarity: 'Rare',
    unlock: { type: 'level', level: 3 },
    description: 'Ánh đèn vàng ấm áp và những kệ sách tri thức vô tận.',
    previewColor: '#1E293B',
  },
  {
    id: 'bd-sunset-rooftop',
    name: 'Sân Thượng Hoàng Hôn',
    slot: 'backdrop',
    rarity: 'Epic',
    unlock: { type: 'streak', days: 3 },
    description: 'Gió mát chiều tà và chân trời rực rỡ sau một ngày cày bài mệt nghỉ.',
    previewColor: '#7C2D12',
  },
  {
    id: 'bd-night-campus',
    name: 'Campus Đêm Huyền Ảo',
    slot: 'backdrop',
    rarity: 'Rare',
    unlock: { type: 'achievement', achievementId: 'first-step' },
    description: 'Đường hoa campus dưới ánh đèn lồng neon tĩnh mịch.',
    previewColor: '#0F172A',
  },
  {
    id: 'bd-python-matrix',
    name: 'Không Gian Ma Trận Số',
    slot: 'backdrop',
    rarity: 'Epic',
    unlock: { type: 'packageClear', packageId: 'pkg-master-python' },
    description: 'Những dòng mã Python xanh ngọc chảy dọc bức tường không gian số.',
    previewColor: '#064E3B',
  },
  {
    id: 'bd-gym-arena',
    name: 'Đấu Trường Thể Lực',
    slot: 'backdrop',
    rarity: 'Epic',
    unlock: { type: 'packageClear', packageId: 'pkg-gym-rat' },
    description: 'Sàn tập đầy năng lượng và nhiệt huyết tuổi trẻ.',
    previewColor: '#14532D',
  },
  {
    id: 'bd-monarch-throne',
    name: 'Ngai Vàng Hư Vô',
    slot: 'backdrop',
    rarity: 'Legendary',
    unlock: { type: 'level', level: 20 },
    description: 'Nơi tối thượng chỉ dành cho những thợ săn kiên trì vượt ngưỡng.',
    previewColor: '#3B0764',
  },

  // FRAMES (>= 6)
  {
    id: 'fr-wooden-apprentice',
    name: 'Khung Gỗ Tân Binh',
    slot: 'frame',
    rarity: 'Common',
    unlock: { type: 'starter' },
    description: 'Khung viền gỗ mộc mạc của những bước đi đầu tiên.',
  },
  {
    id: 'fr-rune-violet',
    name: 'Khung Rune Tím Huyền Bí',
    slot: 'frame',
    rarity: 'Rare',
    unlock: { type: 'level', level: 2 },
    description: 'Khắc các cổ ngữ rune phát sáng tím dịu.',
  },
  {
    id: 'fr-cyber-neon',
    name: 'Khung Cyberpunk Neon Cyan',
    slot: 'frame',
    rarity: 'Epic',
    unlock: { type: 'achievement', achievementId: 'bug-hunter' },
    description: 'Đường nét sắc sảo với ánh sáng neon tương lai.',
  },
  {
    id: 'fr-gold-slayer',
    name: 'Khung Hoàng Kim Diệt Boss',
    slot: 'frame',
    rarity: 'Epic',
    unlock: { type: 'packageClear', packageId: 'pkg-deadline-survivor' },
    description: 'Được đúc từ chiến công vượt qua các kỳ hạn ngặt nghèo.',
  },
  {
    id: 'fr-nature-emerald',
    name: 'Khung Ngọc Bích Thiên Nhiên',
    slot: 'frame',
    rarity: 'Rare',
    unlock: { type: 'achievement', achievementId: 'touch-grass-literally' },
    description: 'Dây leo hoa lá tươi tốt quấn quanh biểu tượng cân bằng.',
  },
  {
    id: 'fr-diamond-legend',
    name: 'Khung Kim Cương Bất Bại',
    slot: 'frame',
    rarity: 'Legendary',
    unlock: { type: 'streak', days: 30 },
    description: 'Minh chứng cho ý chí thép duy trì streak trọn vẹn 30 ngày.',
  },

  // AURAS (>= 4)
  {
    id: 'au-shadow-violet',
    name: 'Hào Quang Bóng Ma Tím',
    slot: 'aura',
    rarity: 'Rare',
    unlock: { type: 'level', level: 4 },
    description: 'Làn khói tím huyền bí bốc lên quanh bước chân nhân vật.',
  },
  {
    id: 'au-cyan-spark',
    name: 'Tia Sét Lượng Tử Cyan',
    slot: 'aura',
    rarity: 'Rare',
    unlock: { type: 'level', level: 6 },
    description: 'Các hạt điện tích cyan xoay vòng quanh thân thể.',
  },
  {
    id: 'au-gold-radiance',
    name: 'Ánh Sáng Mặt Trời Hoàng Kim',
    slot: 'aura',
    rarity: 'Epic',
    unlock: { type: 'achievement', achievementId: 'rise-and-grind' },
    description: 'Hào quang bừng nở rạng rỡ như bình minh ngày mới.',
  },
  {
    id: 'au-galaxy-dust',
    name: 'Bụi Sao Thiên Hà',
    slot: 'aura',
    rarity: 'Legendary',
    unlock: { type: 'level', level: 15 },
    description: 'Hàng ngàn vì tinh tú lấp lánh nâng đỡ từng bước di chuyển.',
  },

  // COMPANIONS (>= 5)
  {
    id: 'cp-cat-dorm',
    name: 'Mèo Lười Ký Túc',
    slot: 'companion',
    rarity: 'Rare',
    unlock: { type: 'achievement', achievementId: 'daily-npc-no-more' },
    description: 'Chú mèo mướp lười biếng nhưng luôn ngồi cạnh bạn mỗi khi ôn bài.',
  },
  {
    id: 'cp-owl-scholar',
    name: 'Cú Trí Tuệ',
    slot: 'companion',
    rarity: 'Rare',
    unlock: { type: 'packageClear', packageId: 'pkg-nerd-mode' },
    description: 'Linh vật cú đêm thức cùng bạn qua những mùa đồ án.',
  },
  {
    id: 'cp-mini-slime',
    name: 'Slime Năng Động',
    slot: 'companion',
    rarity: 'Common',
    unlock: { type: 'level', level: 5 },
    description: 'Khối slime xanh nhảy nhót cổ vũ mỗi khi bạn bấm hoàn thành.',
  },
  {
    id: 'cp-dragon-pup',
    name: 'Rồng Con Lửa Tím',
    slot: 'companion',
    rarity: 'Legendary',
    unlock: { type: 'achievement', achievementId: 'academic-comeback' },
    description: 'Chú rồng nhỏ thở ra đốm lửa tím ăn mừng chiến công học thuật.',
  },
  {
    id: 'cp-robot-buddy',
    name: 'Robot Trợ Lý AI',
    slot: 'companion',
    rarity: 'Epic',
    unlock: { type: 'packageClear', packageId: 'pkg-ai-hcmus-er' },
    description: 'Trợ lý máy lơ lửng luôn sẵn sàng tính toán đạo hàm hỗ trợ.',
  },

  // TITLES (>= 10)
  {
    id: 'tt-auto-level',
    name: 'Tự Động Theo Level',
    slot: 'title',
    rarity: 'Common',
    unlock: { type: 'starter' },
    description: 'Tự động hiển thị danh hiệu tương ứng với cấp bậc level hiện tại.',
  },
  {
    id: 'tt-bug-crusher',
    name: 'Kẻ Hủy Diệt Bug',
    slot: 'title',
    rarity: 'Rare',
    unlock: { type: 'packageClear', packageId: 'pkg-master-python' },
    description: 'Không một dòng mã lỗi nào thoát khỏi tầm mắt.',
  },
  {
    id: 'tt-steady-heart',
    name: 'Trái Tim Bền Bỉ',
    slot: 'title',
    rarity: 'Rare',
    unlock: { type: 'streak', days: 14 },
    description: 'Kiên cường không bỏ cuộc dù bài vở có khó đến đâu.',
  },
  {
    id: 'tt-weapon-pro',
    name: 'Vũ Khí Học Thuật',
    slot: 'title',
    rarity: 'Epic',
    unlock: { type: 'achievement', achievementId: 'academic-weapon' },
    description: 'Chiến thần phòng thi, sẵn sàng cân mọi đề cương.',
  },
  {
    id: 'tt-deadline-reaper',
    name: 'Tử Thần Deadline',
    slot: 'title',
    rarity: 'Epic',
    unlock: { type: 'achievement', achievementId: 'deadline-dodger' },
    description: 'Nộp bài trước hạn là chân ái của cuộc đời sinh viên.',
  },
  {
    id: 'tt-main-character',
    name: 'Nhân Vật Chính',
    slot: 'title',
    rarity: 'Epic',
    unlock: { type: 'packageClear', packageId: 'pkg-main-character-arc' },
    description: 'Tỏa sáng trên sân khấu cuộc đời mình.',
  },
  {
    id: 'tt-grass-enjoyer',
    name: 'Tâm Hồn Yêu Thiên Nhiên',
    slot: 'title',
    rarity: 'Common',
    unlock: { type: 'packageClear', packageId: 'pkg-touch-grass' },
    description: 'Biết học, biết chơi, biết giữ gìn sức khỏe tinh thần.',
  },
  {
    id: 'tt-campus-legend',
    name: 'Huyền Thoại Bách Khoa - Tự Nhiên',
    slot: 'title',
    rarity: 'Legendary',
    unlock: { type: 'level', level: 12 },
    description: 'Tên tuổi được nhắc đến trong các cuộc trò chuyện đồ án.',
  },
  {
    id: 'tt-exam-boss',
    name: 'Bậc Thầy Phòng Thi',
    slot: 'title',
    rarity: 'Epic',
    unlock: { type: 'achievement', achievementId: 'perfect-score' },
    description: 'Đạt điểm tuyệt đối 100% trong bài kiểm tra kiến thức.',
  },
  {
    id: 'tt-master-collector',
    name: 'Đại Thu Thập Gia',
    slot: 'title',
    rarity: 'Legendary',
    unlock: { type: 'achievement', achievementId: 'quest-collector' },
    description: 'Sở hữu nhiều kho tàng nhiệm vụ đa dạng.',
  },

  // NAMEPLATES (>= 4)
  {
    id: 'np-simple-slate',
    name: 'Thẻ Gỗ Thường Sinh Viên',
    slot: 'nameplate',
    rarity: 'Common',
    unlock: { type: 'starter' },
    description: 'Bảng tên sinh viên giản dị viền tối thanh lịch.',
  },
  {
    id: 'np-neon-cyan',
    name: 'Bảng Dạ Quang Neon',
    slot: 'nameplate',
    rarity: 'Rare',
    unlock: { type: 'level', level: 8 },
    description: 'Bảng tên phát quang xanh lam phong cách sci-fi.',
  },
  {
    id: 'np-royal-purple',
    name: 'Bảng Nhung Tím Hoàng Gia',
    slot: 'nameplate',
    rarity: 'Epic',
    unlock: { type: 'level', level: 10 },
    description: 'Chất liệu quý tộc kết hợp viền ánh bạc sang trọng.',
  },
  {
    id: 'np-gold-monarch',
    name: 'Kim Thư Thợ Săn Tối Thượng',
    slot: 'nameplate',
    rarity: 'Legendary',
    unlock: { type: 'achievement', achievementId: 'consistency-plot-twist' },
    description: 'Đúc từ vàng nguyên khối sáng lóa danh giá.',
  },
];

export function getCosmeticById(id: string): CosmeticDef | undefined {
  return COSMETICS.find(c => c.id === id);
}

export function getCosmeticsBySlot(slot: CosmeticSlot): CosmeticDef[] {
  return COSMETICS.filter(c => c.slot === slot);
}
