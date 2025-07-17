'use client';

import { useState, useCallback, useEffect } from 'react';
import { Todo, CreateTodoInput, TodoUpdate } from '@/types';
import { TodoService } from '@/services';
import { useLocalStorage } from './useLocalStorage';

/**
 * TODOの状態管理を行うカスタムフック
 */
export function useTodos() {
  const [todos, setTodos, storageError] = useLocalStorage<Todo[]>('todos', []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useLocalStorageが既にローカルストレージからデータを読み込んでいるため、
  // 追加の初期化は不要

  /**
   * 新しいTODOアイテムを追加する（要件1.2, 1.4）
   */
  const addTodo = useCallback(
    async (input: CreateTodoInput): Promise<void> => {
      try {
        // 入力値の検証
        const validation = TodoService.validateTodoTitle(input.title);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        setIsLoading(true);
        setError(null);

        // 新しいTODOアイテムを作成
        const newTodo = TodoService.createTodo(input);

        // 状態を更新
        const updatedTodos = [...todos, newTodo];
        setTodos(updatedTodos);

        // ローカルストレージに保存
        TodoService.saveTodos(updatedTodos);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'TODOの追加に失敗しました';
        setError(errorMessage);
        console.error('TODO追加エラー:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [todos, setTodos]
  );

  /**
   * TODOアイテムを更新する（要件4.2, 4.4）
   */
  const updateTodo = useCallback(
    async (id: string, updates: TodoUpdate): Promise<void> => {
      try {
        // タイトルが更新される場合は検証
        if (updates.title !== undefined) {
          const validation = TodoService.validateTodoTitle(updates.title);
          if (!validation.isValid) {
            throw new Error(validation.error);
          }
        }

        setIsLoading(true);
        setError(null);

        // TODOリストを更新
        const updatedTodos = TodoService.updateTodo(todos, id, updates);
        setTodos(updatedTodos);

        // ローカルストレージに保存
        TodoService.saveTodos(updatedTodos);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'TODOの更新に失敗しました';
        setError(errorMessage);
        console.error('TODO更新エラー:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [todos, setTodos]
  );

  /**
   * TODOアイテムを削除する（要件5.2, 5.3）
   */
  const deleteTodo = useCallback(
    async (id: string): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        // TODOリストから削除
        const updatedTodos = TodoService.deleteTodo(todos, id);
        setTodos(updatedTodos);

        // ローカルストレージに保存（永続的に削除）
        TodoService.saveTodos(updatedTodos);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'TODOの削除に失敗しました';
        setError(errorMessage);
        console.error('TODO削除エラー:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [todos, setTodos]
  );

  /**
   * TODOアイテムの完了状態を切り替える（要件3.1, 3.4）
   */
  const toggleComplete = useCallback(
    async (id: string): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        // 完了状態を切り替え
        const updatedTodos = TodoService.toggleComplete(todos, id);
        setTodos(updatedTodos);

        // ローカルストレージに保存（変更を永続化）
        TodoService.saveTodos(updatedTodos);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '完了状態の更新に失敗しました';
        setError(errorMessage);
        console.error('完了状態切り替えエラー:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [todos, setTodos]
  );

  /**
   * すべてのTODOアイテムをクリアする
   */
  const clearAllTodos = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // 状態をクリア
      setTodos([]);

      // ローカルストレージからも削除
      TodoService.clearTodos();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'TODOリストのクリアに失敗しました';
      setError(errorMessage);
      console.error('TODOクリアエラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setTodos]);

  /**
   * 完了済みTODOアイテムのみを削除する
   */
  const clearCompletedTodos = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // 未完了のTODOのみを残す
      const activeTodos = todos.filter(todo => !todo.completed);
      setTodos(activeTodos);

      // ローカルストレージに保存
      TodoService.saveTodos(activeTodos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '完了済みTODOの削除に失敗しました';
      setError(errorMessage);
      console.error('完了済みTODOクリアエラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, [todos, setTodos]);

  // 統計情報を計算
  const stats = {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    active: todos.filter(todo => !todo.completed).length,
  };

  // エラー状態を統合（ストレージエラーも含む）
  const combinedError = error || storageError;

  return {
    // データ
    todos,
    stats,
    
    // 状態
    isLoading,
    error: combinedError,
    
    // アクション
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    clearAllTodos,
    clearCompletedTodos,
  };
}