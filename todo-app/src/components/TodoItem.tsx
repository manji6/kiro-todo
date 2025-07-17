'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Todo, TodoUpdate } from '@/types';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (updates: TodoUpdate) => Promise<void>;
  onDelete: () => Promise<void>;
  onToggle: () => Promise<void>;
  isLoading?: boolean;
}

/**
 * 個別のTODOアイテムを表示するコンポーネント
 * 要件2.3, 2.4, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 5.1, 5.3に対応
 */
export function TodoItem({ todo, onUpdate, onDelete, onToggle, isLoading = false }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 編集モードに入った時にフォーカスを設定
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  /**
   * 編集モードを開始する（要件4.1）
   */
  const handleStartEdit = () => {
    if (isLoading) return;
    setIsEditing(true);
    setEditTitle(todo.title);
    setValidationError(null);
  };

  /**
   * 編集をキャンセルする（要件4.3）
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(todo.title);
    setValidationError(null);
  };

  /**
   * 編集を保存する（要件4.2, 4.4）
   */
  const handleSaveEdit = async () => {
    const trimmedTitle = editTitle.trim();
    
    // 入力検証（要件4.4）
    if (!trimmedTitle) {
      setValidationError('タイトルは空にできません');
      return;
    }

    if (trimmedTitle.length > 500) {
      setValidationError('タイトルは500文字以内で入力してください');
      return;
    }

    // 変更がない場合は編集モードを終了
    if (trimmedTitle === todo.title) {
      handleCancelEdit();
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationError(null);
      
      await onUpdate({ title: trimmedTitle });
      setIsEditing(false);
    } catch (err) {
      console.error('TODO更新エラー:', err);
      setValidationError('更新に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * キーボードイベント処理（要件4.2, 4.3）
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  /**
   * 完了状態の切り替え（要件3.1, 3.2, 3.3）
   */
  const handleToggleComplete = async () => {
    if (isLoading || isEditing) return;
    
    try {
      await onToggle();
    } catch (err) {
      console.error('完了状態切り替えエラー:', err);
    }
  };

  /**
   * 削除処理（要件5.1, 5.3）
   */
  const handleDelete = async () => {
    if (isLoading || isSubmitting) return;
    
    try {
      await onDelete();
    } catch (err) {
      console.error('TODO削除エラー:', err);
    }
  };

  /**
   * 作成日時のフォーマット（要件2.3）
   */
  const formatCreatedAt = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今日';
    } else if (diffDays === 1) {
      return '昨日';
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const isItemDisabled = isLoading || isSubmitting;

  return (
    <div
      className={`
        group flex items-center gap-3 p-4 rounded-lg border transition-all duration-200
        ${todo.completed 
          ? 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700' 
          : 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-600'
        }
        hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500
        ${isItemDisabled ? 'opacity-50' : ''}
        animate-fade-in
      `}
    >
      {/* 完了チェックボックス（要件3.1, 3.2, 3.3） */}
      <button
        onClick={handleToggleComplete}
        disabled={isItemDisabled || isEditing}
        className={`
          flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:cursor-not-allowed
          ${todo.completed
            ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
          }
        `}
        aria-label={todo.completed ? 'TODOを未完了にする' : 'TODOを完了にする'}
      >
        {todo.completed && (
          <svg
            className="w-3 h-3 mx-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* TODOコンテンツ */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          /* 編集モード */
          <div className="space-y-2">
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              className={`
                w-full px-3 py-2 rounded border transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${validationError 
                  ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
                  : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700'
                }
                dark:text-white
              `}
              maxLength={500}
              aria-invalid={!!validationError}
            />
            
            {validationError && (
              <div className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationError}
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? '保存中...' : '保存'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 transition-colors dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          /* 表示モード */
          <div className="space-y-1">
            {/* タイトル（要件4.1でクリック可能） */}
            <button
              onClick={handleStartEdit}
              disabled={isItemDisabled}
              className={`
                text-left w-full transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
                disabled:cursor-not-allowed
                ${todo.completed 
                  ? 'text-gray-500 line-through dark:text-gray-400' 
                  : 'text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400'
                }
              `}
              title="クリックして編集"
            >
              <span className="break-words">{todo.title}</span>
            </button>
            
            {/* 作成日時（要件2.3） */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatCreatedAt(todo.createdAt)}
            </div>
          </div>
        )}
      </div>

      {/* 削除ボタン（要件5.1） */}
      {!isEditing && (
        <button
          onClick={handleDelete}
          disabled={isItemDisabled}
          className={`
            flex-shrink-0 p-2 rounded-lg transition-all duration-200
            text-gray-400 hover:text-red-500 hover:bg-red-50
            dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent
            opacity-0 group-hover:opacity-100 transition-opacity
          `}
          aria-label="TODOを削除"
          title="削除"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
}