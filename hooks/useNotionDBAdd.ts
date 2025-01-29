import { useState, useCallback, useMemo } from "react";
import { Client } from "@notionhq/client";
import {
  CreatePageResponse,
} from "@notionhq/client/build/src/api-endpoints";

/**
 * Notionの指定DBにページを追加するカスタムフック
 * @returns addPage, loading, error
 */
export const useNotionDBAdd = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const databaseId = process.env.EXPO_PUBLIC_NOTION_DATABASE_ID;
  const apiKey = process.env.EXPO_PUBLIC_NOTION_API_KEY;

  // Notion API Keyが設定されていない場合はエラーを返す
  if (!apiKey) {
    return { addPage: () => {}, loading, error: new Error("Notion API Key is not set") };
  }

  // Notion Database IDが設定されていない場合はエラーを返す
  if (!databaseId) {
    return { addPage: () => {}, loading, error: new Error("Notion Database ID is not set")};
  }

  // Notionクライアントを生成
  const notion = useMemo(() => {
    return new Client({ auth: apiKey });
  }, [apiKey]);

  // データ追加処理関数
  // createPageParamsには Notion APIの `pages.create()` が受け取るパラメータをそのまま渡す
  const addPage = useCallback(
    async (
      title: string
    ): Promise<CreatePageResponse | null> => {

      if (title.length === 0 || title.trim() === "") {
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Notionにページ（レコード）を作成
        const response = await notion.pages.create({
            parent: {
                type: "database_id",
                database_id: databaseId,
            },
            properties: {
                title: {
                    type: "title",
                    title: [
                        {
                            type: "text",
                            text: {
                                content: title,
                            },
                        },
                    ],
                },
                status: {
                    type: "status",
                    status: {
                        name: "未着手",
                    },
                }
            },
        });
        return response;
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error(String(err)));
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    addPage,
    loading,
    error,
  };
};
