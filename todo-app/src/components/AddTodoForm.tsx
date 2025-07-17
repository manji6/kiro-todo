'use client';

import { useState, FormEvent } from 'react';
import { CreateTodoInput } from '@/types';

interface AddTodoFormProps {
  onAdd: (input: CreateTodoInput) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * 新しいTODOアイテムを作成するフォームコンポーネント
 * 要件1.1, 1.2, 1.3, 1.4に対応
 */
export function AddTodoForm({ onAdd, isLoading = false, error }: AddTodoFormProps) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * フォーム送信処理
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 入力値の検証（要件1.3）
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('タイトルは必須です');
      return;
    }

    if (trimmedTitle.length > 500) {
      setValidationError('タイトルは500文字以内で入力してください');
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationError(null);

      // 新しいTODOアイテムを作成（要件1.2, 1.4）
      await onAdd({ title: trimmedTitle });
      
      // 成功時はフォームをクリア
      setTitle('');
    } catch (err) {
      // エラーは親コンポーネントで処理される
      console.error('TODO追加エラー:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 入力値変更処理
   */
  const handleTitleChange = (value: string) => {
    setTitle(value);
    // 入力中はバリデーションエラーをクリア
    if (validationError) {
      setValidationError(null);
    }
  };

  const displayError = validationError || error;
  const isFormDisabled = isLoading || isSubmitting;

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* タイトル入力フィールド */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="todo-title" className="sr-only">
              TODOタイトル
            </label>
            <input
              id="todo-title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="新しいTODOを入力してください..."
              disabled={isFormDisabled}
              className={`
                w-full px-4 py-3 rounded-lg border transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${displayError 
                  ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
                  : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700'
                }
                dark:text-white placeholder-gray-500 dark:placeholder-gray-400
              `}
              maxLength={500}
              aria-invalid={!!displayError}
              aria-describedby={displayError ? 'todo-error' : undefined}
            />
          </div>
          
          {/* 追加ボタン（要件1.1） */}
          <button
            type="submit"
            disabled={isFormDisabled || !title.trim()}
            className={`
              px-6 py-3 rounded-lg font-medium transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isFormDisabled || !title.trim()
                ? 'bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg'
              }
            `}
            aria-label="TODOを追加"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>追加中...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>+</span>
                <span className="hidden sm:inline">TODOを追加</span>
              </div>
            )}
          </button>
        </div>

        {/* エラーメッセージ表示（要件1.3） */}
        {displayError && (
          <div
            id="todo-error"
            role="alert"
            className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm animate-fade-in"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{displayError}</span>
          </div>
        )}

        {/* 文字数カウンター */}
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span>
            {title.length}/500文字
          </span>
          {title.length > 450 && (
            <span className="text-orange-500 dark:text-orange-400">
              残り{500 - title.length}文字
            </span>
          )}
        </div>
      </form>

      {/* 使用方法のヒント */}
      {!title && !displayError && (
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          <p>💡 ヒント: Enterキーでも追加できます</p>
        </div>
      )}
    </div>
  );
}