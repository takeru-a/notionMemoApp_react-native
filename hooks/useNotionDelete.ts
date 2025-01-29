import { useState, useCallback, useMemo } from "react";
import { Client } from "@notionhq/client";
import {
  DeleteBlockResponse,
} from "@notionhq/client/build/src/api-endpoints";

/**
 * Notionブロック（またはページ）を削除するためのカスタムフック
 */
export function useNotionDelete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const apiKey = process.env.EXPO_PUBLIC_NOTION_API_KEY;

  // Notion API Keyが設定されていない場合はエラーを返す
  if (!apiKey) {
    return { deleteBlock: () => {}, loading, error: new Error("Notion API Key is not set") };
  }

  // Notionクライアントを生成
  const notion = useMemo(() => {
    return new Client({ auth: apiKey });
  }, [apiKey]);

  // ブロックを削除する関数
  const deleteBlock = useCallback(
    async (blockId: string): Promise<DeleteBlockResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        // ブロック削除
        const response = await notion.blocks.delete({
          block_id: blockId,
        });

        return response; // 成功時は削除したブロックの情報を返す
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
    deleteBlock,
    loading,
    error,
  };
}
