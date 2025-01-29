import { useState, useCallback, useMemo } from "react";
import { Client } from "@notionhq/client";
import {
  UpdatePageResponse,
} from "@notionhq/client/build/src/api-endpoints";

/**
 * ページのタイトル（あるいはデータベースプロパティ）を更新するためのカスタムフック
 */
export function useNotionPageTitleUpdate() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const apiKey = process.env.EXPO_PUBLIC_NOTION_API_KEY;

  // Notion API Keyが設定されていない場合はエラーを返す
  if (!apiKey) {
    return { updatePageTitle: () => {}, loading, error: new Error("Notion API Key is not set") };
  }

  // Notionクライアントを生成
  const notion = useMemo(() => {
    return new Client({ auth: apiKey });
  }, [apiKey]);

  /**
   * ページのタイトルを更新
   * @param pageId  対象となるNotionページのID
   * @param newTitle 更新後のタイトル文字列
   * @returns UpdatePageResponse
   */
  const updatePageTitle = useCallback(
    async (
      pageId: string,
      newTitle: string
    ): Promise<UpdatePageResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        // Notionのページを更新 (ページIDとプロパティを指定)
        const response = await notion.pages.update({
          page_id: pageId,
          properties: {
            "title": {
              title: [
                {
                  text: {
                    content: newTitle,
                  },
                },
              ],
            },
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
    updatePageTitle,
    loading,
    error,
  };
}
