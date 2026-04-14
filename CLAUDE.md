# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # 開発サーバー起動（通常 localhost:5173）
npm run build     # プロダクションビルド → dist/
npm run lint      # ESLint
npm run preview   # ビルド済みをローカルでプレビュー
```

プロキシ環境でのパッケージ追加時は事前に設定が必要:
```bash
npm config set proxy http://10.100.2.10:8080
npm config set https-proxy http://10.100.2.10:8080
```

## アーキテクチャ

React 19 + Vite + Tailwind CSS v4（`@tailwindcss/vite` プラグイン経由）。  
バックエンドは Firebase のみ。サーバーサイドのコードは存在しない。

### 認証フロー

`AuthProvider`（`src/contexts/AuthContext.jsx`）が全体をラップし、`onAuthStateChanged` と Firestore の `users/{uid}` ドキュメントをリアルタイム監視する。

```
未ログイン         → LoginScreen（メール/パスワード または Google）
ログイン済み・pending → PendingScreen（オーナー承認待ち）
ログイン済み・approved → アプリ本体（4画面）
オーナー           → 上記 + Header の管理パネルリンク（/admin）
```

オーナーメールアドレスは `src/firebase/auth.js` の `OWNER_EMAIL` 定数で固定。  
初回ログイン時に `ensureUserDoc()` が `users/{uid}` を自動作成し、オーナーなら即 `approved`、それ以外は `pending`。  
メンバーの追加は Firebase Console（Authentication > Users）からのみ行う。アプリ内に新規登録UI はない。

### Firestore データ構造

| コレクション | ドキュメント ID | 内容 |
|---|---|---|
| `users/{uid}` | Firebase Auth UID | `{ email, displayName, status, role, ... }` |
| `availability/{YYYY-MM}/days/{YYYY-MM-DD}` | 日付文字列 | `{ waki: "○", nagai: "△", hasegawa: "×" }` |
| `candidates/{id}` | auto | `{ date, note, votes: {memberId: "○"/"△"/"×"}, confirmed }` |
| `events/{id}` | auto | `{ date, time, destination, meetingPlace, note, gear, members[] }` |

セキュリティルールは `firestore.rules`。`isApproved()` / `isOwner()` ヘルパー関数で制御。  
ルール変更後は Firebase Console > Firestore > ルール から手動で公開する。

### メンバー定義

`src/firebase/config.js` の `MEMBERS` 配列で固定（現在3名: waki / nagai / hasegawa）。  
メンバーを変更する場合はここを編集する。color / bg は各画面の色分けに使われる。

### 日付処理の注意点

`toISOString()` は UTC 基準のため日本時間（UTC+9）で1日ズレる。  
日付文字列の生成には必ず `src/utils/holidays.js` の `toDateStr(date)` パターンか、`'T00:00:00'` サフィックス付きで `new Date()` を構築すること。

### 祝日

`japanese-holidays` パッケージを使用。`src/utils/holidays.js` に集約:
- `formatDateInfo(dateStr)` — ラベル・曜日・祝日フラグをまとめて返す（各コンポーネントで共通使用）
- `getHolidaysOfMonth(yearMonth)` — `{ "YYYY-MM-DD": "祝日名" }` マップ
- 年をまたいで動的に対応（ハードコードなし）

### Hooks / Firebase 操作

`src/hooks/useFirestore.js` にすべての Firestore 操作を集約。  
`use*` 系は `onSnapshot` によるリアルタイム購読、それ以外（`add*` / `update*` / `delete*`）は async 関数。
