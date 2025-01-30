import { useState, useEffect, useMemo, useCallback } from 'react';
import { Client } from '@notionhq/client';
import {
  ListBlockChildrenResponse,
} from '@notionhq/client/build/src/api-endpoints';

interface useNotionPageFetchOptions {
  blockId: string;
  pageSize?: number;
}

export function useNotionPageFetch({
  blockId,
  pageSize = 100,
}: useNotionPageFetchOptions) {
  const [data, setData] = useState<ListBlockChildrenResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // 環境変数からNotionトークンを取得
  const apiKey = process.env.EXPO_PUBLIC_NOTION_API_KEY;

  // Notion API Keyが設定されていない場合はエラーを返す
  if (!apiKey) {
    return { data, loading, error: new Error("Notion API Key is not set"), refetch: () => {} };
  }

  // Notionクライアントを生成
  const notion = useMemo(() => {
    return new Client({ auth: apiKey });
  }, [apiKey]);

  // 非同期でブロックの子要素を取得する関数
  const fetchPageContent = useCallback(async () => {

    // ローディング開始
    setLoading(true);
    setError(null);
    try {
        const response = await notion.blocks.children.list({
            block_id: blockId,
            page_size: pageSize,
        });
        setData(response);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error(String(err)));
      }
    } finally {
      setLoading(false);
    }
  }, [blockId, pageSize, notion, apiKey]);

  // マウント時にデータを取得
  useEffect(() => {
    fetchPageContent();
  }, [fetchPageContent]);

  return {
    data,
    loading,
    error,
    refetch: fetchPageContent,
  };
}
