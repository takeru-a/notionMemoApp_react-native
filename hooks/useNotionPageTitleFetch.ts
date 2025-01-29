import { useState, useEffect, useCallback, useMemo } from "react";
import { Client } from "@notionhq/client";
import {
    GetPageResponse,
    PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

/**
 * Notionのページを1件取得するカスタムフック
 */
export function useNotionPageTitleFetch(pageId: string) {
  const [data, setData] = useState<PageObjectResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const apiKey = process.env.EXPO_PUBLIC_NOTION_API_KEY;

  // Notion API Keyが設定されていない場合はエラーを返す
  if (!apiKey) {
    return { data, loading, error: new Error("Notion API Key is not set"), refetch: () => {} };
  }

  // Notionクライアントを生成
  const notion = useMemo(() => {
    return new Client({ auth: apiKey });
  }, [apiKey]);


  // ページを取得する関数
  const fetchPageInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // ページ情報を取得
      const response = await notion.pages.retrieve({ page_id: pageId });
      const res = response as PageObjectResponse;
      setData(res);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error(String(err)));
      }
    } finally {
      setLoading(false);
    }
  }, [pageId, apiKey, notion]);

  // マウント時やpageIdが変わったときにデータを取得
  useEffect(() => {
    fetchPageInfo();
  }, [fetchPageInfo]);

  return {
    data,
    loading,
    error,
    refetch: fetchPageInfo, // 手動で再取得したい場合に使う
  };
}
