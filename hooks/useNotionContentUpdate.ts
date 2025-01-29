import { useState, useCallback, useMemo } from "react";
import { Client } from "@notionhq/client";
import {
  UpdateBlockResponse,
} from "@notionhq/client/build/src/api-endpoints";

/**
 * Notionのブロックを更新するためのフック
 * 例: heading_2, paragraph などに含まれる rich_text を書き換える
 */
export function useNotionContentUpdate() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const apiKey = process.env.EXPO_PUBLIC_NOTION_API_KEY;

  // Notion API Keyが設定されていない場合はエラーを返す
  if (!apiKey) {
    return { updateBlock: () => {}, loading, error: new Error("Notion API Key is not set") };
  }

  // Notionクライアントを生成
  const notion = useMemo(() => {
    return new Client({ auth: apiKey });
  }, [apiKey]);

  /**
   * ページのタイトルを更新
   * @param blockId  対象となるNotionブロックのID
   * @param updatecontent 更新後のタイトル文字列
   * @returns UpdateBlockResponse
   */
  const updateBlock = useCallback(
    async (
      blockId: string,
      updatecontent: string
    ): Promise<UpdateBlockResponse | null> => {
      setLoading(true);
      setError(null);

      try {

        // `notion.blocks.update()` でブロックを更新
        const response = await notion.blocks.update({
          block_id: blockId,
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: updatecontent,
                },
              },
            ],
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
    updateBlock,
    loading,
    error,
  };
}
