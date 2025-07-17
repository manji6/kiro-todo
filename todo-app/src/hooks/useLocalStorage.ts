'use client';

import { useState, useCallback } from 'react';

/**
 * ローカルストレージと同期するカスタムフック
 * @param key ローカルストレージのキー
 * @param initialValue 初期値
 * @returns [値, 値を設定する関数, エラー状態]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, string | null] {
  const [error, setError] = useState<string | null>(null);

  // 初期値を計算する関数（useStateの初期化関数として使用）
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // ローカルストレージが利用できない場合の処理（要件6.4）
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('ローカルストレージが利用できません');
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }

      const parsedItem = JSON.parse(item);
      
      // 日付オブジェクトの復元処理
      if (Array.isArray(parsedItem)) {
        return parsedItem.map((item: unknown) => {
          if (item && typeof item === 'object' && item !== null && 'createdAt' in item) {
            return {
              ...item,
              createdAt: new Date((item as { createdAt: string }).createdAt),
            };
          }
          return item;
        });
      }

      return parsedItem;
    } catch (err) {
      console.error(`ローカルストレージからの読み込みエラー (key: ${key}):`, err);
      return initialValue;
    }
  });

  // 値を設定してローカルストレージに保存する関数
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // 関数の場合は現在の値を渡して実行
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        setStoredValue(valueToStore);

        // ローカルストレージが利用できない場合の処理（要件6.4）
        if (typeof window === 'undefined' || !window.localStorage) {
          console.warn('ローカルストレージが利用できないため、データは永続化されません');
          setError('データは永続化されません（ローカルストレージ無効）');
          return;
        }

        // ローカルストレージに保存（要件6.1）
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        setError(null);
      } catch (err) {
        console.error(`ローカルストレージへの保存エラー (key: ${key}):`, err);
        
        // ストレージ容量制限への対応
        if (err instanceof Error && err.name === 'QuotaExceededError') {
          setError('ストレージ容量が不足しています。古いデータを削除してください。');
        } else {
          setError(`データの保存に失敗しました: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue, error];
}