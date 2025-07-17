import { Todo, CreateTodoInput, TodoUpdate } from '@/types';

/**
 * TODOアイテムのCRUD操作を提供するサービスクラス
 */
export class TodoService {
  private static readonly STORAGE_KEY = 'todos';

  /**
   * 新しいTODOアイテムを作成する（要件1.2）
   * @param input TODOアイテムの作成データ
   * @returns 作成されたTODOアイテム
   */
  static createTodo(input: CreateTodoInput): Todo {
    return {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      completed: false, // 要件1.4: 新しいTODOは「未完了」ステータス
      createdAt: new Date(),
    };
  }

  /**
   * TODOリストをローカルストレージに保存する（要件6.1）
   * @param todos 保存するTODOリスト
   */
  static saveTodos(todos: Todo[]): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('ローカルストレージが利用できません');
        return;
      }

      const serializedTodos = JSON.stringify(todos);
      window.localStorage.setItem(this.STORAGE_KEY, serializedTodos);
    } catch (error) {
      console.error('TODOリストの保存に失敗しました:', error);
      
      // ストレージ容量制限への対応
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('ストレージ容量が不足しています。古いデータを削除してください。');
      }
      
      throw new Error('データの保存に失敗しました');
    }
  }

  /**
   * ローカルストレージからTODOリストを読み込む（要件6.2）
   * @returns 読み込まれたTODOリスト
   */
  static loadTodos(): Todo[] {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('ローカルストレージが利用できません');
        return [];
      }

      const stored = window.localStorage.getItem(this.STORAGE_KEY);
      
      if (!stored) {
        return [];
      }

      const parsedTodos = JSON.parse(stored);
      
      // データの整合性チェックと日付オブジェクトの復元
      if (!Array.isArray(parsedTodos)) {
        console.warn('保存されたデータの形式が正しくありません');
        return [];
      }

      return parsedTodos.map((todo: unknown) => {
        // 必須フィールドの存在チェック
        if (!todo || typeof todo !== 'object' || !('id' in todo) || !('title' in todo) || !('completed' in todo)) {
          console.warn('不正なTODOデータを検出しました:', todo);
          return null;
        }

        const todoObj = todo as { id: string; title: string; completed: boolean; createdAt?: string };
        if (!todoObj.id || !todoObj.title || typeof todoObj.completed !== 'boolean') {
          console.warn('不正なTODOデータを検出しました:', todo);
          return null;
        }

        return {
          id: todoObj.id,
          title: todoObj.title,
          completed: todoObj.completed,
          createdAt: new Date(todoObj.createdAt || Date.now()),
        };
      }).filter((todo): todo is Todo => todo !== null);
      
    } catch (error) {
      console.error('TODOリストの読み込みに失敗しました:', error);
      
      // データ破損時の復旧処理
      console.warn('データが破損している可能性があります。空のリストで開始します。');
      return [];
    }
  }

  /**
   * TODOアイテムを更新する
   * @param todos 現在のTODOリスト
   * @param id 更新するTODOのID
   * @param updates 更新データ
   * @returns 更新されたTODOリスト
   */
  static updateTodo(todos: Todo[], id: string, updates: TodoUpdate): Todo[] {
    return todos.map(todo => {
      if (todo.id === id) {
        return {
          ...todo,
          ...updates,
          // タイトルが更新される場合はトリムする
          title: updates.title ? updates.title.trim() : todo.title,
        };
      }
      return todo;
    });
  }

  /**
   * TODOアイテムを削除する
   * @param todos 現在のTODOリスト
   * @param id 削除するTODOのID
   * @returns 削除後のTODOリスト
   */
  static deleteTodo(todos: Todo[], id: string): Todo[] {
    return todos.filter(todo => todo.id !== id);
  }

  /**
   * TODOアイテムの完了状態を切り替える
   * @param todos 現在のTODOリスト
   * @param id 切り替えるTODOのID
   * @returns 更新されたTODOリスト
   */
  static toggleComplete(todos: Todo[], id: string): Todo[] {
    return todos.map(todo => {
      if (todo.id === id) {
        return {
          ...todo,
          completed: !todo.completed,
        };
      }
      return todo;
    });
  }

  /**
   * TODOリストをクリアする
   */
  static clearTodos(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch (error) {
      console.error('TODOリストのクリアに失敗しました:', error);
      throw new Error('データのクリアに失敗しました');
    }
  }

  /**
   * 入力値の検証
   * @param title TODOのタイトル
   * @returns 検証結果
   */
  static validateTodoTitle(title: string): { isValid: boolean; error?: string } {
    if (!title || typeof title !== 'string') {
      return { isValid: false, error: 'タイトルは必須です' };
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      return { isValid: false, error: 'タイトルは空にできません' };
    }

    if (trimmedTitle.length > 500) {
      return { isValid: false, error: 'タイトルは500文字以内で入力してください' };
    }

    return { isValid: true };
  }
}