# 設計ドキュメント

## 概要

TODO管理Webアプリケーションは、Next.jsとTailwindCSSを使用したモダンなReactベースのSPA（Single Page Application）として設計されます。TypeScriptを使用して型安全性を確保し、ブラウザのローカルストレージを使用してデータを永続化します。

## アーキテクチャ

### 全体アーキテクチャ

```
┌─────────────────────────────────────┐
│         Next.js App Router          │
│  ┌─────────────┐  ┌─────────────┐   │
│  │ Page        │  │ Layout      │   │
│  │ Components  │  │ Components  │   │
│  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│        React Components             │
│  ┌─────────────┐  ┌─────────────┐   │
│  │ TodoList    │  │ EmailModal  │   │
│  │ TodoItem    │  │ AddTodoForm │   │
│  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│       Custom Hooks & Services      │
│  ┌─────────────┐  ┌─────────────┐   │
│  │ useTodos    │  │ useEmail    │   │
│  │ Hook        │  │ Hook        │   │
│  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│            データ層                 │
│  ┌─────────────┐  ┌─────────────┐   │
│  │ ローカル     │  │ TypeScript  │   │
│  │ ストレージ   │  │ Types       │   │
│  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────┘
```

### 技術スタック

- **フレームワーク**: Next.js 14+ (App Router)
- **言語**: TypeScript
- **UIライブラリ**: React 18+
- **スタイリング**: TailwindCSS
- **データストレージ**: ブラウザローカルストレージ
- **メール機能**: mailto: プロトコル
- **開発ツール**: ESLint, Prettier
- **パッケージマネージャー**: npm/yarn

## コンポーネントとインターフェース

### 1. TypeScript型定義

```typescript
// types/todo.ts
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface EmailData {
  recipient: string;
  subject: string;
  body: string;
}
```

### 2. カスタムフック

```typescript
// hooks/useTodos.ts
export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  
  const addTodo = (title: string) => void;
  const updateTodo = (id: string, updates: Partial<Todo>) => void;
  const deleteTodo = (id: string) => void;
  const toggleComplete = (id: string) => void;
  
  return { todos, addTodo, updateTodo, deleteTodo, toggleComplete };
};

// hooks/useLocalStorage.ts
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // ローカルストレージとの同期処理
};
```

### 3. Reactコンポーネント

#### ページコンポーネント
```typescript
// app/page.tsx
export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <TodoApp />
    </main>
  );
}
```

#### メインコンポーネント
```typescript
// components/TodoApp.tsx
export const TodoApp: React.FC = () => {
  const { todos, addTodo, updateTodo, deleteTodo, toggleComplete } = useTodos();
  
  return (
    <div className="max-w-2xl mx-auto">
      <AddTodoForm onAdd={addTodo} />
      <TodoList 
        todos={todos}
        onUpdate={updateTodo}
        onDelete={deleteTodo}
        onToggle={toggleComplete}
      />
      <EmailModal todos={todos} />
    </div>
  );
};
```

#### 個別コンポーネント
```typescript
// components/TodoList.tsx
interface TodoListProps {
  todos: Todo[];
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

// components/TodoItem.tsx
interface TodoItemProps {
  todo: Todo;
  onUpdate: (updates: Partial<Todo>) => void;
  onDelete: () => void;
  onToggle: () => void;
}

// components/AddTodoForm.tsx
interface AddTodoFormProps {
  onAdd: (title: string) => void;
}

// components/EmailModal.tsx
interface EmailModalProps {
  todos: Todo[];
}
```

### 4. サービス層

```typescript
// services/todoService.ts
export class TodoService {
  static createTodo(title: string): Todo {
    return {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date(),
    };
  }
  
  static saveTodos(todos: Todo[]): void {
    localStorage.setItem('todos', JSON.stringify(todos));
  }
  
  static loadTodos(): Todo[] {
    const stored = localStorage.getItem('todos');
    return stored ? JSON.parse(stored) : [];
  }
}

// services/emailService.ts
export class EmailService {
  static formatTodoList(todos: Todo[]): string {
    // TODOリストをメール本文用にフォーマット
  }
  
  static generateEmailContent(todos: Todo[], recipient: string, subject: string): EmailData {
    // メールデータの生成
  }
  
  static openEmailClient(emailData: EmailData): void {
    // mailto:リンクでメールクライアントを開く
  }
}
```

## データモデル

### TODOアイテム構造

```json
{
  "id": "uuid-string",
  "title": "タスクのタイトル",
  "completed": false,
  "createdAt": "2025-01-17T10:30:00.000Z"
}
```

### ローカルストレージ構造

```json
{
  "todos": [
    {
      "id": "1",
      "title": "買い物に行く",
      "completed": false,
      "createdAt": "2025-01-17T10:30:00.000Z"
    },
    {
      "id": "2", 
      "title": "レポートを書く",
      "completed": true,
      "createdAt": "2025-01-17T09:15:00.000Z"
    }
  ]
}
```

## エラーハンドリング

### 1. 入力検証
- 空のタイトルでのTODO作成を防ぐ
- メール送信時の宛先検証
- 不正なデータ形式の処理

### 2. ストレージエラー
- ローカルストレージが利用できない場合の処理
- ストレージ容量制限への対応
- データ破損時の復旧処理

### 3. ユーザーフィードバック
- エラーメッセージの表示
- 成功時の確認メッセージ
- ローディング状態の表示

## テスト戦略

### 1. 単体テスト
- TODOアイテムモデルのテスト
- TODOマネージャーサービスのテスト
- メール送信サービスのテスト
- ユーティリティ関数のテスト

### 2. 統合テスト
- UI操作とデータ更新の連携テスト
- ローカルストレージとの連携テスト
- メール機能の統合テスト

### 3. E2Eテスト
- 完全なユーザーフローのテスト
- ブラウザ間の互換性テスト
- レスポンシブデザインのテスト

### 4. テストツール
- Jest (単体テスト・統合テスト)
- Playwright (E2Eテスト)
- ESLint (コード品質)

## セキュリティ考慮事項

### 1. XSS対策
- ユーザー入力のサニタイゼーション
- innerHTML使用時の注意
- CSP (Content Security Policy) の設定

### 2. データ保護
- ローカルストレージデータの適切な管理
- 機密情報の非保存
- ブラウザセキュリティ機能の活用

## パフォーマンス最適化

### 1. React最適化
- React.memo()を使用した不要な再レンダリングの防止
- useCallback()とuseMemo()の適切な使用
- コンポーネントの適切な分割

### 2. Next.js最適化
- App Routerの活用
- 静的生成（SSG）の利用
- 画像最適化（next/image）

### 3. データ管理
- 大量のTODOアイテムに対する効率的な処理
- ローカルストレージの適切な使用
- 状態管理の最適化

### 4. TailwindCSS最適化
- 未使用CSSの自動削除（purge）
- JIT（Just-In-Time）コンパイルの活用

## アクセシビリティ

### 1. キーボードナビゲーション
- Tab順序の適切な設定
- キーボードショートカットの提供
- フォーカス管理

### 2. スクリーンリーダー対応
- 適切なARIAラベルの設定
- セマンティックHTMLの使用
- 状態変更の通知

### 3. 視覚的配慮
- 十分なコントラスト比
- 拡大表示への対応
- カラーブラインドネスへの配慮