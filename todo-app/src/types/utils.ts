/**
 * 型安全性を確保するためのユーティリティ型定義
 */

/**
 * 日付文字列をDateオブジェクトに変換する際の型ガード
 */
export const isValidDate = (date: unknown): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * 文字列が空でないことを確認する型ガード
 */
export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * メールアドレスの基本的な形式チェック
 */
export const isValidEmail = (email: unknown): email is string => {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * UUIDの形式チェック
 */
export const isValidUUID = (id: unknown): id is string => {
  if (typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};