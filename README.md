# notionMemoApp_react-native
**作成したアプリについて**  
今回作成したのは、Notionのデータベースにデータを保存するメモアプリを作成しました。  
こうすることでアプリで作成したメモをNotion上でも参照することができ、Notionで作成したメモをアプリ側で表示させることができます。

機能としては、以下のものを実装しました。
- メモの新規作成
- メモ内容の作成・更新
- メモの削除
- 作成したメモの一覧表示
- メモの詳細を表示

画面としては以下の2画面を作成しました。  
**ホーム画面**  
この画面はアプリ起動時に初めに表示され、Notionデータベースに保存されているメモの全量を取得し、一覧表示しています。  
メモを新規作成する場合は画面下部のテキストボックスからメモタイトルを入力することで作成することができます。また、メモタイトルの更新とメモの削除は各アイコンを選択することで行うことができます。  

**メモ編集画面**  
この画面はホーム画面から該当するメモを選択されることで遷移され、メモの詳細内容の表示及び内容の追加・更新・削除を行うことができます。  
また、React Nativeのためandroid、ios両方のアプリを作成することができますが今回はandroidアプリとしてビルドすることを考えて実装しております。基本的に同じコードでandroid、ios両方にビルドすることができますがネイティブ部分やレイアウト部分で多少の差異がある可能性があります。
