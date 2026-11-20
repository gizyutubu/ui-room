# UI Room

GitHub Pagesで公開できる、Supabase PostgreSQL + Realtime対応のリアルタイム共同UIデザイン決定・ホワイトボードアプリです。`index.html` / `style.css` / `app.js` の静的構成で、ビルドは不要です。

## Supabase初期設定（メール不要・名前＋パスワード）

1. [Supabase](https://supabase.com/dashboard)でプロジェクトを作成します。
2. **SQL Editor**で、[`supabase-custom-auth.sql`](./supabase-custom-auth.sql) を実行します。名前・パスワードのユーザー表とセッション表を作成します。
3. Supabase CLIでEdge Functionをデプロイします。`supabase functions deploy ui-room-api --no-verify-jwt` を実行してください。
4. Edge FunctionのSecretsに `SUPABASE_SERVICE_ROLE_KEY` を設定します。これはブラウザへ絶対に置きません。
5. これまでのSupabase AuthのEmail設定は不要です。画面の名前とパスワードだけで登録・ログインできます。

このアプリはSupabase Edge Functionで名前＋パスワード認証を行います。パスワードはPBKDF2でハッシュ化して保存し、平文パスワードやメールアドレスは保存しません。表示名は日本語のままデータベースへ保存します。データ同期はEdge Function経由のポーリングです。

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
