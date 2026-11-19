# UI Room

GitHub Pagesで公開できる、Supabase PostgreSQL + Realtime対応のリアルタイム共同UIデザイン決定・ホワイトボードアプリです。`index.html` / `style.css` / `app.js` の静的構成で、ビルドは不要です。

## Supabase初期設定

1. [Supabase](https://supabase.com/dashboard)でプロジェクトを作成します。
2. **Authentication → Providers → Email**を有効化します。メール確認を使わず、名前＋パスワードだけで利用する場合は **Confirm email** をオフにします。
3. **SQL Editor**で、リポジトリの [`supabase-schema.sql`](./supabase-schema.sql) を全量実行します。テーブル作成、RLS、Realtime publicationを設定します。このSQLはポリシー重複とRealtime重複を回避するため、途中まで実行済みでも再実行できます。
4. **Project Settings → API**からProject URLとPublishable key（または旧anon key）を確認し、`app.js` 冒頭の `supabaseUrl` と `supabaseAnonKey` に貼り付けます。`service_role` keyは絶対に貼り付けないでください。
5. GitHub Pagesのドメインを **Authentication → URL Configuration → Redirect URLs** に追加します（例：`https://gizyutubu.github.io/ui-room/`）。

このアプリはユーザーが入力した名前を内部メール形式（`名前@ui-room.example.com`）に変換してSupabase Authのメール／パスワード認証を利用します。ルームやチャット、投票、描画データはPostgreSQLのJSONBテーブルに保存し、Supabase RealtimeのPostgres Changesで同期します。

## GitHub Pages公開

1. GitHubリポジトリの **Settings → Pages** を開きます。
2. **Deploy from a branch**、ブランチ `main`、フォルダ `/ (root)` を選びます。
3. 保存後に表示されるURLへアクセスします。

## 実装済み機能

- 名前＋パスワードの新規登録・ログイン、Supabase Auth
- ルーム作成・6桁招待コード参加・招待リンクコピー
- メンバーのオンライン状態、ルーム履歴
- テーマ、色、角丸、フォント、レイアウトのリアルタイム同期
- 各項目への投票、ホストまたは過半数による確定ロック
- Pointer Events対応の共同キャンバス、ペン・マーカー・消しゴム・PNG保存・自分の取り消し
- 永続化チャット、入力中表示
- CSS変数と次の開発用AIプロンプトのコピー

## 注意

ブラウザから使えるのはSupabaseのPublishable／anon keyだけです。RLSを無効化したり、service_role keyをフロントエンドへ置いたりしないでください。Supabase公式も、公開テーブルはRLSと適切なGRANT／ポリシーを組み合わせて保護するよう案内しています。
