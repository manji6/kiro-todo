/**
 * TODOアイテムの型定義
 */
export interface Todo {
  /** 一意識別子 */
  id: string;
  /** TODOのタイトル */
  title: string;
  /** 完了状態 */
  completed: boolean;
  /** 作成日時 */
  createdAt: Date;
}

/**
 * メール送信用のデータ型定義
 */
export interface EmailData {
  /** 宛先メールアドレス */
  recipient: string;
  /** メールの件名 */
  subject: string;
  /** メール本文 */
  body: string;
}

/**
 * TODOアイテムの部分更新用の型
 */
export type TodoUpdate = Partial<Omit<Todo, 'id' | 'createdAt'>>;

/**
 * 新しいTODOアイテム作成用の型
 */
export type CreateTodoInput = Pick<Todo, 'title'>;