import { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';

import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from "expo-linear-gradient"

import { BlockObjectResponse } from '@node_modules/@notionhq/client/build/src/api-endpoints';
import { useNotionPageFetch } from '@hooks/useNotionPageFetch';
import { useNotionContentAdd } from '@hooks/useNotionContentAdd';
import { useNotionDelete } from '@hooks/useNotionDelete';
import { useNotionContentUpdate } from '@hooks/useNotionContentUpdate';
import { useNotionPageTitleFetch } from '@hooks/useNotionPageTitleFetch';

import { Textarea, TextareaInput } from "@/components/ui/textarea"
import { Center } from '@/components/ui/center';
import { HStack } from "@/components/ui/hstack"
import { Box } from '@components/ui/box';
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@components/ui/modal';
import { Heading } from '@components/ui/heading';
import { ButtonText, Button, ButtonIcon } from '@components/ui/button';
import { ArrowLeftIcon, Icon, TrashIcon } from '@components/ui/icon';
import { User } from "lucide-react-native"
import { Avatar } from '@components/ui/avatar';

const DetailsScreen = () => {

  // URLパラメータからIDを取得
  const { id } = useLocalSearchParams();
  const PageId = Array.isArray(id) ? id[0] : id;

  // Notionページのタイトルを取得
  const { data: pageData, loading: pageLoading, error: pageError } = useNotionPageTitleFetch(PageId);
  // Notionページのコンテンツを取得
  const { data, loading, error, refetch } = useNotionPageFetch({ blockId: PageId });
  // Notionページにコンテンツを追加
  const { addContent, loading: add_loading, error: add_error } = useNotionContentAdd();
  // Notionページのコンテンツを削除
  const { deleteBlock, loading: delete_loading, error: delete_error } = useNotionDelete();
  // Notionページのコンテンツを更新
  const { updateBlock, loading: update_loading, error: update_error } = useNotionContentUpdate();

  // コンテンツ内容
  const [contents, setContents] = useState('');
  // 更新用コンテンツ内容
  const [upcontents, setUpContets] = useState('');
  // ヘッダー部分のタイトル
  const title = pageData?.properties?.title.type === "title" ? pageData?.properties.title.title[0]?.plain_text : "Edit";

  // 削除用モーダルの表示
  const [showDLModal, setShowDLModal] = useState(false);
  // 更新用モーダルの表示
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  // 更新&削除対象のID
  const [targetId, setTargetId] = useState('');

  // エラーが発生した場合の表示
  if (error || add_error || pageError || delete_error || update_error) {
    const err = error || add_error;
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Error: {err?.message}</Text>
      </View>
    );
  }

  // ローディング中の表示
  if (loading || add_loading || pageLoading || delete_loading || update_loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  const renderItem = ({ item }: {item: BlockObjectResponse} ) => {
    const content = item.type === "paragraph" ? item.paragraph.rich_text[0]?.plain_text : "";
    return (
      <View>
        <Box style={styles.box}>
          <LinearGradient
            style={styles.container}
            colors={["#8637CF", "#0F55A1"]}
            start={[1, 0]}
            end={[0, 1]}
            >
            <Avatar size="md" className="bg-indigo-300 border-2 border-indigo-600 mr-2">
              <Icon as={User} size="xl" className="text-indigo-900"/>
            </Avatar>
            <Text
            className='flex-1'
              style={styles.item}
              onPress={() => {
                setTargetId(item.id);
                setShowUpdateModal(true);
                setUpContets(content);
              }}
              >
              {content}
            </Text>
          </LinearGradient>
        </Box>
      </View>
    );
  };

  const content = (data?.results || []) as BlockObjectResponse[];

  return (
    <View style={styles.screen}>
      {/* ヘッダー部分 */}
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: title,
        }}
      />
      <FlatList
        style={styles.list}
        data={content} // データソース
        renderItem={renderItem}// 各アイテムの描画
        keyExtractor={(item) => item.id}
      />

      {/* テキストエリア */}
      <HStack
        space="sm" reversed={false}
        className="w-11/12"
        style={styles.input}>
        <Textarea
          className="w-11/12 h-auto bg-white"
          size="xl"
          >
          <TextareaInput
            onChangeText={(text) => setContents(text)}
            placeholder="Enter Content here..." type='text' className=''/>
          </Textarea>
          <Center>
            <Feather name="play" size={24} color="blue"
            onPress={
              () => {
                if (contents.trim() !== '') {
                  addContent(PageId, contents)?.then(() => {
                    refetch();
                    setContents('');
                  });
                }
              }}
              />
          </Center>
      </HStack>

      {/* メインモーダル */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false)
        }}
      >
        <ModalBackdrop />
        <ModalContent className="max-w-[375px]">
            <Button
              variant="link"
              size="sm"
              onPress={() => {
                setShowUpdateModal(false)
              }}
              className="gap-1 self-start"
              >
              <ButtonIcon as={ArrowLeftIcon} />
              <ButtonText>Back</ButtonText>
            </Button>
            <Textarea
            className="h-[185px] w-full rounded">
              <TextareaInput
              onChangeText={(text) => setUpContets(text)}
              type='text' className='align-top'
              defaultValue={upcontents}
              />
            </Textarea>
          <ModalBody className="mb-5" contentContainerClassName="">
            <Heading size="md" className="text-typography-950 text-center">
            Delete or update content!
            </Heading>
            <Text style={{ fontSize: 14 }} className="text-typography-500 text-center">
            Click the bottom right button to update, or the bottom left button to delete.
            </Text>
          </ModalBody>
          <ModalFooter className="w-full">
            <Button
              variant="outline"
              action="primary"
              size="sm"
              onPress={() => {
                setShowDLModal(true)
              }}
              className="flex-grow"
            >
              <ButtonText>Delete</ButtonText>
            </Button>
            <Button
              onPress={() => {
                updateBlock(targetId, upcontents)?.then(() => {
                  refetch();
                  setUpContets('');
                  setTargetId('');
                });
                setShowUpdateModal(false)
              }}
              size="sm"
              className="flex-grow"
            >
              <ButtonText>Update</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 削除用モーダル */}
      <Modal
        isOpen={showDLModal}
        onClose={() => {
          setShowDLModal(false)
        }}>
        <ModalBackdrop />
        <ModalContent className="max-w-[305px] items-center">
          <ModalHeader>
            <Box className="w-[56px] h-[56px] rounded-full bg-background-error items-center justify-center">
              <Icon as={TrashIcon} className="stroke-error-600" size="xl" />
            </Box>
          </ModalHeader>
          <ModalBody className="mt-0 mb-4">
            <Heading size="md" className="text-typography-950 mb-2 text-center">
              Delete memo
            </Heading>
            <Text style={{ fontSize: 14 }} className="text-typography-500 text-center">
              Are you sure you want to delete this memo? This action cannot be
              undone.
            </Text>
          </ModalBody>
          <ModalFooter className="w-full">
            <Button
              variant="outline"
              action="secondary"
              size="sm"
              onPress={() => {
                setShowDLModal(false)
              }}
              className="flex-grow"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              onPress={() => {
                deleteBlock(targetId)?.then(() => {
                  refetch();
                  setTargetId('');
                });
                setShowDLModal(false);
                setShowUpdateModal(false);
              }}
              size="sm"
              className="flex-grow">
              <ButtonText>Delete</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </View>
  );
}

export default DetailsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    flex: 1,
    marginBottom: 80,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box : {
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  container: {
    padding: 15,
    marginHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  item: {
    color: 'white',
    fontSize: 20,
  },
  input: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 1,
  },
});
