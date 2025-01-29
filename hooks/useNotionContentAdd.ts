import { useState, useCallback, useMemo } from "react";
import { Client } from "@notionhq/client";
import {
  AppendBlockChildrenResponse,
} from "@notionhq/client/build/src/api-endpoints";

/**
 * Notionの指定ブロックに子要素を追加するカスタムフック
 * @returns addContent, loading, error
 */
export const useNotionContentAdd = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const apiKey = process.env.EXPO_PUBLIC_NOTION_API_KEY;

  // Notion API Keyが設定されていない場合はエラーを返す
  if (!apiKey) {
    return { addContent: () => {}, loading, error: new Error("Notion API Key is not set") };
  }

  // Notionクライアントを生成
  const notion = useMemo(() => {
    return new Client({ auth: apiKey });
  }, [apiKey]);

  // ブロック（ページ）に子要素を追加する関数
  const addContent = useCallback(
    async (
      blockId: string,
      content: string,
    ): Promise<AppendBlockChildrenResponse | null> => {

      if (content.length === 0 || content.trim() === "") {
          return null;
          }
      // ローディング開始  
      setLoading(true);
      setError(null);

      try {
        // ブロックの子要素を追加
        const response = await notion.blocks.children.append({
          block_id: blockId,
          children: [
            {
              type: "paragraph",
              paragraph: {
                rich_text: [
                  {
                    type: "text",
                    text: {
                      content: content,
                    },
                  },
                ],
              },
            },
          ],
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
    addContent,
    loading,
    error,
  };
}
