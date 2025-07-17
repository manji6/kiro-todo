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
      <div className="max-w-2xl mx-auto">
        {/* TODO アプリケーションがここに配置される */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              TODOアプリを準備中...
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              コンポーネントの実装が完了次第、ここにTODOリストが表示されます。
            </p>
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
        <p>© 2025 TODO管理アプリ - Next.js & TypeScript で構築</p>
      </footer>
    </main>
  );
}
