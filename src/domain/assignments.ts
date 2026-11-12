export interface Assignment {
  id: string;
  title: string; // Tên bài tập
  subject: string; // Môn học
  deadline: string; // Thời gian / deadline (YYYY-MM-DDTHH:mm hoặc ISO)
  description: string; // Mô tả bài tập
  completed: boolean; // Trạng thái hoàn thành
  priority?: 'high' | 'medium' | 'low';
  isUrgent?: boolean; // Tùy chọn đặt mức hạn Gấp / Quan trọng
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

export const ASSIGNMENTS_STORAGE_KEY = 'solo_levelling_assignments_v1';

export const SAMPLE_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-demo-1',
    title: 'Báo cáo Lab Cấu Trúc Dữ Liệu: BST & AVL Tree',
    subject: 'Cấu Trúc Dữ Liệu & Giải Thuật (CS101)',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    description: 'Cài đặt cây nhị phân tìm kiếm BST và cây cân bằng AVL bằng C++. So sánh tốc độ tìm kiếm và chèn 100.000 phần tử ngẫu nhiên. Nộp file zip source code + PDF báo cáo.',
    completed: false,
    priority: 'high',
    isUrgent: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'asg-demo-2',
    title: 'Bài tập tuần: Đạo hàm riêng & Vi phân cấp 2',
    subject: 'Giải Tích & Toán Cao Cấp (MATH101)',
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    description: 'Làm toàn bộ bài tập phần cực trị hàm nhiều biến sách giáo trình trang 112-115. Chụp ảnh rõ nét bài làm viết tay hoặc gõ LaTeX xuất file PDF.',
    completed: false,
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'asg-demo-3',
    title: 'Thuyết trình nhóm: Cơ chế Self-Attention trong Transformer',
    subject: 'Nhập Môn Trí Tuệ Nhân Tạo (AI101)',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    description: 'Chuẩn bị 15 slide PowerPoint và kịch bản thuyết trình 10 phút về Attention is All You Need. Phân tích ma trận Q, K, V và Multi-Head Attention.',
    completed: true,
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Sắp xếp danh sách bài tập theo thời gian kết thúc (deadline) từ sớm đến muộn (Earliest deadline first).
 * Nếu deadline bằng nhau hoặc không hợp lệ, sắp xếp theo tên hoặc thời gian tạo.
 */
export function sortAssignmentsByDeadline(assignments: Assignment[]): Assignment[] {
  return [...assignments].sort((a, b) => {
    // 1. So sánh thời gian deadline
    const timeA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
    const timeB = b.deadline ? new Date(b.deadline).getTime() : Infinity;

    const validA = !isNaN(timeA);
    const validB = !isNaN(timeB);

    if (validA && validB) {
      if (timeA !== timeB) return timeA - timeB; // Sớm hơn đứng trước
    } else if (validA && !validB) {
      return -1;
    } else if (!validA && validB) {
      return 1;
    }

    // 2. Nếu deadline trùng nhau, so sánh theo title
    return a.title.localeCompare(b.title, 'vi');
  });
}

/**
 * Thêm một bài tập mới vào danh sách và tự động sắp xếp theo deadline
 */
export function addAssignment(
  list: Assignment[],
  item: Omit<Assignment, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Assignment[] {
  const newAssignment: Assignment = {
    ...item,
    id: item.id || `asg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    completed: Boolean(item.completed),
    completedAt: item.completed ? item.completedAt || new Date().toISOString() : undefined,
    createdAt: item.createdAt || new Date().toISOString(),
  };

  const updated = [...list, newAssignment];
  return sortAssignmentsByDeadline(updated);
}

/**
 * Cập nhật thông tin bài tập và tự động sắp xếp lại theo deadline
 */
export function updateAssignment(list: Assignment[], item: Assignment): Assignment[] {
  const previous = list.find(task => task.id === item.id);
  const completedAt = !item.completed ? undefined : previous?.completed
    ? previous.completedAt || previous.updatedAt : new Date().toISOString();
  const updatedItem = {
    ...item,
    completedAt,
    updatedAt: new Date().toISOString(),
  };
  const updated = list.map(a => (a.id === item.id ? updatedItem : a));
  return sortAssignmentsByDeadline(updated);
}

/**
 * Xóa một bài tập theo ID
 */
export function deleteAssignment(list: Assignment[], id: string): Assignment[] {
  return list.filter(a => a.id !== id);
}

/**
 * Đổi trạng thái hoàn thành / chưa hoàn thành của bài tập
 */
export function toggleAssignment(list: Assignment[], id: string): Assignment[] {
  return list.map(a => (a.id === id ? { ...a, completed: !a.completed, completedAt: a.completed ? undefined : new Date().toISOString(), updatedAt: new Date().toISOString() } : a));
}

/**
 * Định dạng deadline sang chuỗi hiển thị tiếng Việt và tính toán khoảng cách thời gian
 */
export function formatDeadlineDisplay(
  deadlineStr: string,
  now: Date = new Date()
): {
  formatted: string;
  relative: string;
  status: 'overdue' | 'today' | 'soon' | 'upcoming';
  diffDays: number;
} {
  if (!deadlineStr) {
    return {
      formatted: 'Chưa đặt hạn chót',
      relative: 'Không có hạn',
      status: 'upcoming',
      diffDays: 999,
    };
  }

  const d = new Date(deadlineStr);
  if (isNaN(d.getTime())) {
    return {
      formatted: deadlineStr,
      relative: 'Ngày không hợp lệ',
      status: 'upcoming',
      diffDays: 999,
    };
  }

  // Format date & time
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  const formatted = `${hours}:${minutes} • ${day}/${month}/${year}`;

  // Calculate relative difference
  const diffMs = d.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays);
    const relative = overdueDays === 0 ? 'Quá hạn vài giờ' : `Quá hạn ${overdueDays} ngày`;
    return { formatted, relative, status: 'overdue', diffDays };
  }

  if (diffHours <= 24) {
    const relative = diffHours <= 1 ? 'Hạn chót trong 1 giờ tới!' : `Còn ${diffHours} giờ (Hôm nay)`;
    return { formatted, relative, status: 'today', diffDays };
  }

  if (diffDays <= 3) {
    return { formatted, relative: `Còn ${diffDays} ngày (Gấp)`, status: 'soon', diffDays };
  }

  return { formatted, relative: `Còn ${diffDays} ngày`, status: 'upcoming', diffDays };
}

/**
 * Lưu danh sách bài tập vào LocalStorage
 */
export function saveAssignmentsToStorage(list: Assignment[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Không thể lưu danh sách bài tập vào localStorage:', err);
  }
}

/**
 * Tải danh sách bài tập từ LocalStorage
 */
export function loadAssignmentsFromStorage(): Assignment[] {
  if (typeof window === 'undefined') return SAMPLE_ASSIGNMENTS;
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
    if (!raw) return SAMPLE_ASSIGNMENTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return sortAssignmentsByDeadline(parsed);
    }
    return SAMPLE_ASSIGNMENTS;
  } catch {
    return SAMPLE_ASSIGNMENTS;
  }
}
