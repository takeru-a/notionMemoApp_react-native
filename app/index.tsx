import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';

import { Link } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from '@expo/vector-icons';

import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { useNotionDBFetch } from "@hooks/useNotionDBFetch";
import { useNotionDBAdd } from "@hooks/useNotionDBAdd";
import { useNotionDelete } from "@hooks/useNotionDelete";
import { useNotionPageTitleUpdate } from '@hooks/useNotionPageTitleUpdate';

import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@components/ui/modal';
import { Button, ButtonIcon, ButtonText } from '@components/ui/button';
import { Box } from '@components/ui/box';
import { Heading } from '@components/ui/heading';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { CheckIcon, Icon, TrashIcon } from "@/components/ui/icon"
import { ArrowLeftIcon } from "@/components/ui/icon"

const App = () => {

  // Notion Databaseにページを追加するカスタムフック
  const { addPage, loading: add_loading, error: add_error } = useNotionDBAdd();
  // Notion Databaseからページを削除するカスタムフック
  const { deleteBlock, loading: delete_loading, error: delete_error } = useNotionDelete();
  // Notion Databaseのページタイトルを更新するカスタムフック
  const { updatePageTitle, loading: update_loading, error: update_error } = useNotionPageTitleUpdate();

  // 追加するページのタイトル
  const [pageTitle, setPageTitle] = useState('');
  // 更新するページのタイトル
  const [updateTitle, setUpdateTitle] = useState('');
  // 削除用モーダルの表示
  const [showDLModal, setShowDLModal] = useState(false);
  // 更新用モーダルの表示
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  // 削除対象のID
  const [deleteId, setDeleteId] = useState('');
  // 更新対象のID
  const [updateId, setUpdateId] = useState('');

  // ソート条件
  const sorts = useMemo(
    () => [
      {
        property: "createdAt",
        direction: "descending" as "descending" | "ascending",
      },
    ],
    []
  );

  // Notion Databaseからデータを取得
  const { data, loading, error, refetch } = useNotionDBFetch({sorts});

  // エラーが発生した場合の表示
  if (error || add_error || delete_error || update_error) {
    const err = error || add_error;
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Error: {err?.message}</Text>
      </View>
    );
  }

  // ローディング中の表示
  if (loading || add_loading || delete_loading || update_loading) {
    return(
    <View style={styles.center}>
        <ActivityIndicator size="large" color="#007BFF" />
    </View>
    )
  }

  // リストアイテムの描画
  const renderItem = ({ item }: {item: PageObjectResponse} ) => {
    const title = item.properties?.title.type === "title" ? item.properties.title.title[0]?.plain_text : "";
    return (
      <View>
        <LinearGradient
          style={styles.container}
          colors={["#8637CF", "#0F55A1"]}
          start={[1, 0]}
          end={[0, 1]}>
          <Link href={`/edit/${item.id}`}>
            <Text style={styles.titleText} >{title}</Text>
          </Link>
          <View style={styles.row}>
            <Ionicons 
              name="pencil" 
              size={24} 
              color="#fff" 
              style={styles.icon} 
              onPress={() => {
                setShowUpdateModal(true)
                setUpdateId(item.id)
              }}
              />
            <Ionicons 
              name="trash" 
              size={24} 
              color="#fff" 
              style={styles.icon} 
              onPress={() => {
                setShowDLModal(true)
                setDeleteId(item.id)
              }}
              />
          </View>
        </LinearGradient>
      </View>
    );
  };

  // ページ一覧
  const pages = (data?.results || []) as PageObjectResponse[];

  // 空のページは除外
  const filteredPages = pages.filter(
    (item) =>
      item.properties?.title.type === 'title' &&
      item.properties.title.title[0]?.plain_text
  );

  return (
    <View style={styles.screen}>
      <FlatList
        style={styles.list}
        data={filteredPages} // データソース
        renderItem={renderItem}// 各アイテムの描画
        keyExtractor={(item) => item.id}
      />
      <Input
        className="w-11/12 bg-white text-2xl"
        variant="outline"
        size="xl"
        style={styles.input}>
        <InputField
          onChangeText={(text) => setPageTitle(text)}
          placeholder="Enter Text here..." type='text' className='mr-4'/>
            <InputSlot className="pr-3"
              onPress={() => {
                if (pageTitle.trim() !== '') {
                  addPage(pageTitle)?.then(() => {
                    refetch();
                    setPageTitle('');
                  });
                }
              }}>
              <InputIcon as={CheckIcon} className='text-sky-600'/>
            </InputSlot>
        </Input>

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
                setShowDLModal(false);
                deleteBlock(deleteId)?.then(() => {
                  refetch();
                  setDeleteId('');
                });
              }}
              size="sm"
              className="flex-grow">
              <ButtonText>Delete</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 更新用モーダル */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false)
        }}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader className="flex-col items-start gap-0.5">
            <Heading>Change the title?</Heading>
            <Text style={{ fontSize: 14 }} className="text-typography-500 text-center">
            Please enter the title to be changed
            </Text>
          </ModalHeader>
          <ModalBody className="mb-4">
            <Input>
              <InputField 
                placeholder="Enter Text here..."
                onChangeText={(text) => setUpdateTitle(text)}
                 />
            </Input>
          </ModalBody>
          <ModalFooter className="flex-col items-start">
            <Button
              onPress={() => {
                updatePageTitle(updateId, updateTitle)?.then(() => {
                  refetch();
                  setUpdateTitle('');
                  setUpdateId('');
                });
                setShowUpdateModal(false)
              }}
              isDisabled={!updateTitle}
              className="w-full"
            >
              <ButtonText>Submit</ButtonText>
            </Button>
            <Button
              variant="link"
              size="sm"
              onPress={() => {
                setShowUpdateModal(false)
              }}
              className="gap-1"
            >
              <ButtonIcon as={ArrowLeftIcon} />
              <ButtonText>Back to home</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  titleText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  icon: {
    marginLeft: 24,
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
  container: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  input: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 1,
  },
});
