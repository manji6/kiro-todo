import { TodoApp } from '@/components';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ヘッダー */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          TODO管理アプリ
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          シンプルで使いやすいタスク管理
        </p>
      </header>

      {/* メインコンテンツエリア */}
      <TodoApp />

      {/* フッター */}
      <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
        <p>© 2025 TODO管理アプリ - Next.js & TypeScript で構築</p>
      </footer>
    </main>
  );
}
