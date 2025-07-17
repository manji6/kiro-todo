'use client';

import { useTodos } from '@/hooks';
import { AddTodoForm, TodoList } from '@/components';

/**
 * TODOアプリケーションのメインコンポーネント
 * すべてのTODO関連コンポーネントを統合し、状態管理を行う
 */
export function TodoApp() {
  const {
    // データ
    todos,
    stats,
    
    // 状態
    isLoading,
    error,
    
    // アクション
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    clearAllTodos,
    clearCompletedTodos,
  } = useTodos();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ヘッダーセクション */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          あなたのTODOリスト
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          タスクを追加して、効率的に管理しましょう
        </p>
      </div>

      {/* TODO追加フォーム */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <AddTodoForm
          onAdd={addTodo}
          isLoading={isLoading}
          error={error}
        />
      </div>

      {/* アクションボタン群 */}
      {todos.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
          {/* 完了済みクリアボタン */}
          {stats.completed > 0 && (
            <button
              onClick={clearCompletedTodos}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/30"
            >
              完了済みを削除 ({stats.completed})
            </button>
          )}

          {/* 全削除ボタン */}
          <button
            onClick={() => {
              if (window.confirm('すべてのTODOを削除しますか？この操作は取り消せません。')) {
                clearAllTodos();
              }
            }}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            すべて削除
          </button>
        </div>
      )}

      {/* TODOリスト */}
      <TodoList
        todos={todos}
        onUpdate={updateTodo}
        onDelete={deleteTodo}
        onToggle={toggleComplete}
        isLoading={isLoading}
        error={error}
      />

      {/* フッター情報 */}
      {todos.length > 0 && (
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {stats.active > 0 ? (
              <span>
                あと <strong className="text-blue-600 dark:text-blue-400">{stats.active}</strong> 個のタスクが残っています
              </span>
            ) : (
              <span className="text-green-600 dark:text-green-400 font-medium">
                🎉 すべてのタスクが完了しました！
              </span>
            )}
          </div>
          
          {/* 励ましメッセージ */}
          {stats.completed > 0 && stats.active === 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🎊</span>
                <div className="text-center">
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    素晴らしい！すべてのタスクを完了しました
                  </p>
                  <p className="text-green-600 dark:text-green-300 text-sm mt-1">
                    今日も一日お疲れさまでした
                  </p>
                </div>
                <span className="text-2xl">🎊</span>
              </div>
            </div>
          )}
          
          {/* 進捗に応じた励ましメッセージ */}
          {stats.active > 0 && stats.completed > 0 && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              💪 順調に進んでいます！この調子で頑張りましょう
            </div>
          )}
        </div>
      )}

      {/* 初回利用時のヒント */}
      {todos.length === 0 && !isLoading && !error && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="text-center space-y-3">
            <div className="text-3xl">✨</div>
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
              TODOアプリへようこそ！
            </h3>
            <div className="text-sm text-blue-600 dark:text-blue-300 space-y-2">
              <p>このアプリでできること：</p>
              <ul className="text-left max-w-sm mx-auto space-y-1">
                <li>• 📝 新しいタスクの追加</li>
                <li>• ✅ タスクの完了マーク</li>
                <li>• ✏️ タスクの編集（クリックで編集）</li>
                <li>• 🗑️ 不要なタスクの削除</li>
                <li>• 💾 データの自動保存</li>
              </ul>
            </div>
            <p className="text-xs text-blue-500 dark:text-blue-400">
              まずは上のフォームから最初のTODOを追加してみましょう！
            </p>
          </div>
        </div>
      )}

      {/* デバッグ情報（開発環境のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-gray-400 dark:text-gray-500">
          <summary className="cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">
            デバッグ情報
          </summary>
          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
            {JSON.stringify({ stats, isLoading, error: !!error }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}