'use client';

import { Todo, TodoUpdate } from '@/types';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onUpdate: (id: string, updates: TodoUpdate) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * TODOアイテムのリストを表示するコンポーネント
 * 要件2.1, 2.2, 2.3, 2.4, 5.4に対応
 */
export function TodoList({
  todos,
  onUpdate,
  onDelete,
  onToggle,
  isLoading = false,
  error
}: TodoListProps) {
  // 統計情報の計算
  const stats = {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    active: todos.filter(todo => !todo.completed).length,
  };

  // TODOリストを完了状態でソート（未完了を上に、完了済みを下に）
  const sortedTodos = [...todos].sort((a, b) => {
    // 完了状態で分ける
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // 同じ完了状態内では作成日時の新しい順
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  /**
   * 空のリスト状態の表示（要件2.2, 5.4）
   */
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
        TODOリストが空です
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        上のフォームから新しいTODOを追加してみましょう
      </p>
      <div className="text-sm text-gray-400 dark:text-gray-500">
        💡 ヒント: 日々のタスクを整理して生産性を向上させましょう
      </div>
    </div>
  );

  /**
   * エラー状態の表示
   */
  const renderErrorState = () => (
    <div className="text-center py-8">
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
        エラーが発生しました
      </h3>
      <p className="text-red-500 dark:text-red-400 text-sm">
        {error}
      </p>
    </div>
  );

  /**
   * ローディング状態の表示
   */
  const renderLoadingState = () => (
    <div className="text-center py-8">
      <div className="inline-flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-600 dark:text-gray-400">読み込み中...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 統計情報の表示 */}
      {todos.length > 0 && (
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">合計:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
              {stats.total}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">未完了:</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-xs font-medium">
              {stats.active}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">完了済み:</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
              {stats.completed}
            </span>
          </div>
          {stats.total > 0 && (
            <div className="flex items-center gap-2 text-sm ml-auto">
              <span className="font-medium text-gray-700 dark:text-gray-300">進捗:</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {Math.round((stats.completed / stats.total) * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* メインコンテンツ */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* エラー状態 */}
        {error && renderErrorState()}
        
        {/* ローディング状態 */}
        {isLoading && todos.length === 0 && renderLoadingState()}
        
        {/* 空のリスト状態（要件2.2, 5.4） */}
        {!isLoading && !error && todos.length === 0 && renderEmptyState()}
        
        {/* TODOリスト表示（要件2.1, 2.3, 2.4） */}
        {todos.length > 0 && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTodos.map((todo) => (
              <div key={todo.id} className="p-1">
                <TodoItem
                  todo={todo}
                  onUpdate={(updates) => onUpdate(todo.id, updates)}
                  onDelete={() => onDelete(todo.id)}
                  onToggle={() => onToggle(todo.id)}
                  isLoading={isLoading}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* フィルター/ソートオプション（将来の拡張用） */}
      {todos.length > 5 && (
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {todos.length}個のTODOアイテムを表示中
          </p>
        </div>
      )}

      {/* 完了済みアイテムが多い場合のヒント */}
      {stats.completed > 10 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                完了済みアイテムが多くなっています
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                パフォーマンス向上のため、古い完了済みアイテムの削除を検討してください
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}