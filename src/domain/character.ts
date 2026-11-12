/**
 * Ràng buộc tên nhân vật:
 * - Không được để trống.
 * - Các dấu cách dư đằng trước và đằng sau đều bị loại bỏ (trim).
 * - Khi nhập liệu, loại bỏ dấu cách đầu dòng ngay lập tức.
 * - Độ dài hợp lệ từ 2 đến 20 ký tự sau khi loại bỏ khoảng trắng thừa.
 */

export interface CharacterNameValidation {
  isValid: boolean;
  cleanName: string;
  error?: string;
}

/**
 * Kiểm tra và chuẩn hóa tên nhân vật theo đúng quy định.
 */
export function validateCharacterName(rawName: string): CharacterNameValidation {
  if (typeof rawName !== 'string') {
    return {
      isValid: false,
      cleanName: '',
      error: 'Tên nhân vật không được để trống.',
    };
  }

  // Loại bỏ khoảng trắng thừa đằng trước và đằng sau
  const cleanName = rawName.trim();

  if (cleanName.length === 0) {
    return {
      isValid: false,
      cleanName: '',
      error: 'Tên nhân vật không được để trống. Vui lòng nhập tên.',
    };
  }

  if (cleanName.length < 2) {
    return {
      isValid: false,
      cleanName,
      error: 'Tên nhân vật cần tối thiểu 2 ký tự.',
    };
  }

  if (cleanName.length > 20) {
    return {
      isValid: false,
      cleanName,
      error: 'Tên nhân vật không được vượt quá 20 ký tự.',
    };
  }

  return {
    isValid: true,
    cleanName,
  };
}

/**
 * Xử lý trực tiếp khi người dùng nhập tên:
 * Loại bỏ ngay các dấu cách dư đằng trước (leading spaces).
 */
export function sanitizeCharacterInput(value: string): string {
  return value.replace(/^\s+/, '');
}
