import { useState, useEffect, useCallback, useMemo } from "react";
import { QueryDatabaseResponse, QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import { Client } from "@notionhq/client";

// Notion Databaseからデータを取得するためのカスタムフック
type UseNotionDBFetchOptions = {
  filter?: QueryDatabaseParameters["filter"];
  sorts?: QueryDatabaseParameters["sorts"];
};

/**
 * Notion Databaseからデータを取得するカスタムフック
 * @param filter, sorts
 * @returns data, loading, error, refetch
 */
export const useNotionDBFetch = ({
  filter,
  sorts,
}: UseNotionDBFetchOptions = {}) => {
  const [data, setData] = useState<QueryDatabaseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const databaseId = process.env.EXPO_PUBLIC_NOTION_DATABASE_ID;
  const apiKey = process.env.EXPO_PUBLIC_NOTION_API_KEY;

  // Notion API Keyが設定されていない場合はエラーを返す
  if (!apiKey) {
    return { data, loading, error: new Error("Notion API Key is not set"), refetch: () => {} };
  }

  // Notion Database IDが設定されていない場合はエラーを返す
  if (!databaseId) {
    return { data, loading, error: new Error("Notion Database ID is not set"), refetch: () => {} };
  }

  // Notionクライアントを生成
  const notion = useMemo(() => {
    return new Client({ auth: apiKey });
  }, [apiKey]);

  // 非同期でNotion APIを呼び出す関数
  const fetchData = useCallback(async () => {

    // ローディング開始
    setLoading(true);
    try {
      // データを取得
      const response = await notion.databases.query({
        database_id: databaseId,
        filter: filter,
        sorts: sorts,
      });
      // 取得したデータを反映
      setData(response);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error(String(err)));
      }
    } finally {
      // ローディング完了
      setLoading(false);
    }
  }, [filter, sorts]);

  // マウント時にデータを取得
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  

  return { data, loading, error, refetch: fetchData };
};
