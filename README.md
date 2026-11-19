# UI Room

GitHub Pagesで公開できる、Firebase Realtime Database対応のリアルタイム共同UIデザイン決定・ホワイトボードアプリです。`index.html` / `style.css` / `app.js` の静的構成で、ビルドは不要です。

## Firebase初期設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成します。
2. **Authentication → Sign-in method → メール/パスワード**を有効化します。Googleログインは不要です。
3. **Realtime Database → データベースを作成**を選び、ロケーションを決定します。
4. **プロジェクトの設定 → マイアプリ → ウェブアプリ**を追加し、表示された `firebaseConfig` を `app.js` 冒頭の `firebaseConfig` に貼り付けます。
5. Realtime Databaseのルールに次を貼り付けます。認証済みユーザーだけがルームデータへアクセスでき、各ユーザーが自分のプロフィールを更新できます。

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "users": {
      "$uid": {
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "rooms": {
      "$room": {
        ".validate": "newData.hasChildren(['name'])",
        "members": {
          "$uid": {
            ".write": "auth != null && auth.uid === $uid"
          }
        }
      }
    }
  }
}
```

> 本番運用でより厳格な権限管理を行う場合は、ルームメンバー判定を追加してください。Firebaseのメール/パスワード認証では、入力名をURLエンコードした内部メール（`名前@ui-room.example.com`）に変換して利用します。

## GitHub Pages公開

1. GitHubリポジトリの **Settings → Pages** を開きます。
2. **Deploy from a branch**、ブランチ `main`、フォルダ `/ (root)` を選びます。
3. 保存後に表示されるURLへアクセスします。Firebase Authenticationの承認済みドメインに、GitHub Pagesのドメイン（例：`gizyutubu.github.io`）を追加してください。

## 実装済み機能

- 名前＋パスワードの新規登録・ログイン、Firebase Authentication
- ルーム作成・6桁招待コード参加・招待リンクコピー
- メンバーのオンライン状態、ルーム履歴
- テーマ、色、角丸、フォント、レイアウトのリアルタイム同期
- 各項目への投票、ホストまたは過半数による確定ロック
- Pointer Events対応の共同キャンバス、ペン・マーカー・消しゴム・PNG保存・自分の取り消し
- 永続化チャット、入力中表示
- CSS変数と次の開発用AIプロンプトのコピー
