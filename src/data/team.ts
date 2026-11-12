export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  favoriteQuest: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'member-01',
    name: 'Thành viên 01 (Trưởng Nhóm)',
    role: 'Product Lead & Architecture',
    bio: 'Chịu trách nhiệm định hình tầm nhìn sản phẩm SOLO LEVELLING, thiết kế luồng người dùng và kiến trúc hệ thống ledger.',
    favoriteQuest: 'Morning Spawn',
  },
  {
    id: 'member-02',
    name: 'Thành viên 02',
    role: 'Frontend & UI/UX Designer',
    bio: 'Xây dựng hệ thống design tokens dark fantasy, giao diện mobile-first và hoạt họa cảm xúc chiến đấu cho nhân vật.',
    favoriteQuest: 'Bug Hunter',
  },
  {
    id: 'member-03',
    name: 'Thành viên 03',
    role: 'Domain Logic & Game Engine',
    bio: 'Hiện thực hóa công thức level, logic streak, hệ thống chống cộng dồn trùng lặp XP và bộ câu hỏi Đấu trường thi cử.',
    favoriteQuest: 'Academic Comeback',
  },
  {
    id: 'member-04',
    name: 'Thành viên 04',
    role: 'Campus Map & Event System',
    bio: 'Thiết kế bản đồ Campus trực quan, hệ thống độ thân quen từng địa điểm và cơ chế kích hoạt các mùa sự kiện.',
    favoriteQuest: 'Touch Grass, Literally',
  },
  {
    id: 'member-05',
    name: 'Thành viên 05',
    role: 'Cosmetics & Character Importer',
    bio: 'Phát triển script nhập nhân vật động, hệ thống 8 slot trang phục và tủ đồ tùy biến cho người chơi.',
    favoriteQuest: 'Deadline Slayer',
  },
];
