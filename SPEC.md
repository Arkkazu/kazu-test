# 開発環境仕様書

## 概要

WordPress をヘッドレス CMS として使用し、Next.js をフロントエンドとするローカル開発環境。
Docker Compose で全サービスを管理し、Traefik がリバースプロキシとして HTTPS を終端する。

---

## アクセス URL

| 用途 | URL |
|------|-----|
| フロントエンド | https://www.local.test |
| WordPress 管理画面 | https://cms.local.test/wp-admin |
| WordPress GraphQL エンドポイント | https://cms.local.test/graphql |
| Traefik ダッシュボード | http://localhost:8080 |

> `local.test` ドメインは hosts ファイルへの登録が必要（例: `127.0.0.1 www.local.test cms.local.test`）

---

## サービス構成

```
[ブラウザ]
    |
[Traefik v3]  :80(→443リダイレクト) / :443(TLS終端) / :8080(ダッシュボード)
    |               |
[next :3000]→→[wordpress :80]  ← next がサーバーサイドで GraphQL を内部呼び出し
                    |         |
                 [redis]    [db]
```

> **注意:** `next` は docker-compose の `depends_on` で `wordpress` を指定していないため、起動順次第で初回の GraphQL リクエストが失敗することがある。`docker compose up` 後に `wordpress` が healthy になるまで待ってからページにアクセスすること。

### db（MariaDB 10.11）

| 項目 | 値 |
|------|----|
| 文字コード | utf8mb4 / utf8mb4_unicode_ci |
| データ永続化 | `./data/db` |
| ヘルスチェック | `healthcheck.sh --connect --innodb_initialized` (10s間隔, 最大10回) |

### redis（Redis 7-alpine）

| 項目 | 値 |
|------|----|
| 最大メモリ | 128MB |
| 退避ポリシー | allkeys-lru |
| 用途 | WordPress オブジェクトキャッシュ |

### wordpress（WordPress 6.5 / PHP 8.2 / Apache）

| 項目 | 値 |
|------|----|
| WP_HOME / WP_SITEURL | https://cms.local.test |
| Redis 接続 | ホスト `redis` / ポート `6379` |
| wp-content 永続化 | `./data/wp-content` |
| テーブルプレフィックス | `wp_` |

必要プラグイン（手動インストール）:
- **WPGraphQL** — GraphQL エンドポイントを提供
- **Redis Object Cache** — Redis キャッシュ連携
- **Custom Post Type UI（CPT UI）** — カスタム投稿タイプの作成（Show in GraphQL を有効にすれば WPGraphQL が自動的に公開する）

### next（Next.js 16 / React 19 / Node 20-alpine）

| 項目 | 値 |
|------|----|
| 起動コマンド | `npm run dev`（ホットリロード有効） |
| ソースマウント | `./frontend:/app`（node_modules・.next は除外） |
| ファイル監視 | `WATCHPACK_POLLING=500`（500ms ポーリング。下記参照） |
| ヘルスチェック | `GET /health`（5s間隔, 最大10回） |

> **ファイル監視について:** Docker on Windows はホスト側のファイル変更イベント（inotify）がコンテナに伝わらないため、ポーリング方式で代替している。`WATCHPACK_POLLING` は webpack 専用の設定であり、Next.js 16 がデフォルトで使用する Turbopack では機能しない。そのため `package.json` の dev スクリプトに `--webpack` フラグを付与して webpack モードで起動している（`next dev --webpack`）。ポーリング間隔は 500ms のため、保存から反映まで最大数秒かかる。

### traefik（Traefik v3）

| 項目 | 値 |
|------|----|
| HTTP | :80 → HTTPS リダイレクト |
| HTTPS | :443（TLS 終端） |
| ダッシュボード | :8080（insecure モード） |
| TLS 証明書 | `./certs/local.test.pem` / `./certs/local.test-key.pem` |
| 設定方式 | 静的: `traefik/traefik.yml` / 動的: `traefik/dynamic/tls.yml` |

---

## フロントエンド技術スタック

| 技術 | バージョン |
|------|------------|
| Next.js | 16.2.3 |
| React | 19.2.4 |
| TypeScript | ^5 |
| Tailwind CSS | ^4 |
| ESLint | ^9 |
| Geist（next/font/google） | — |

### ディレクトリ構造

```
frontend/
├── tailwind.config.js      # Tailwind v4 JS カスタマイズ設定
├── postcss.config.mjs
├── next.config.ts
├── tsconfig.json
├── package.json
├── eslint.config.mjs
├── Dockerfile
├── public/
└── src/
    ├── app/
    │   ├── layout.tsx          # ルートレイアウト（Header / Footer を含む）
    │   ├── page.tsx            # トップページ（通常投稿 + お知らせ一覧）
    │   ├── globals.css         # グローバルスタイル（Tailwind）
    │   ├── health/route.ts     # ヘルスチェックエンドポイント
    │   ├── posts/[slug]/       # 通常投稿詳細ページ
    │   │   └── page.tsx
    │   ├── news/[slug]/        # お知らせ詳細ページ
    │   │   └── page.tsx
    │   └── api/revalidate/     # On-demand ISR トリガー
    │       └── route.ts
    ├── components/
    │   ├── Header.tsx          # サイト共通ヘッダー
    │   ├── Footer.tsx          # サイト共通フッター
    │   └── PostCard.tsx        # 投稿・お知らせ共通カードコンポーネント
    └── lib/
        ├── wordpress.ts        # データ取得関数（Post / Page / NewsItem 型定義含む）
        └── graphql/
            ├── client.ts       # fetchGraphQL（サーバー/クライアント URL 切替）
            └── queries/
                ├── posts.ts    # 投稿クエリ（一覧 / 単件 / スラッグ一覧）
                ├── pages.ts    # 固定ページクエリ（一覧 / 単件 / スラッグ一覧）
                └── news.ts     # お知らせクエリ（一覧 / 単件 / スラッグ一覧）
```

### GraphQL データ取得

`fetchGraphQL` はサーバーサイド（`typeof window === "undefined"`）では Docker 内部ネットワーク経由（`http://wordpress/graphql`）、クライアントサイドでは公開 URL（`https://cms.local.test/graphql`）を使用する。

キャッシュ戦略:
- `tags: ["wp-posts"]` / `tags: ["wp-pages"]` / `tags: ["wp-news"]` — タグベース再検証
- `revalidate: 3600` — 1時間ごとの時間ベース再検証（スラッグ一覧等）

> **開発環境の注意:** `NODE_ENV=development` の場合は `cache: 'no-store'`（キャッシュ完全無効）に切り替わるため、WordPress に投稿した内容はリロードで即時反映される。本番環境では `revalidate: 3600` が適用されるため即時反映されない。即時反映が必要な場合は On-demand ISR を使用する。なお `revalidate: 0` は「0秒後に再検証」（stale-while-revalidate）であり `cache: 'no-store'` とは異なる。

### On-demand ISR（再検証 API）

`POST /api/revalidate` に `x-revalidate-secret` ヘッダーで `REVALIDATE_SECRET` を渡すことで任意タグを即時再検証できる。WordPress 側のプラグイン（Webhook）と組み合わせて使用する。

リクエスト例:
```http
POST /api/revalidate
x-revalidate-secret: <REVALIDATE_SECRET>
Content-Type: application/json

{ "postType": "post", "slug": "my-post-slug" }
```

ボディパラメータ:
| パラメータ | 値 | 動作 |
|------------|-----|------|
| `postType` | `"post"` | `wp-posts` タグ + `wp-post-{slug}` を再検証 |
| `postType` | `"page"` | `wp-pages` タグ + `wp-page-{slug}` を再検証 |
| `postType` | `"news"` | `wp-news` タグ + `wp-news-{slug}` を再検証 |
| 省略 | — | `wp-posts` / `wp-pages` / `wp-news` を全再検証 |

### Tailwind CSS v4

**設定ファイル構成:**

| ファイル | 役割 |
|----------|------|
| `frontend/tailwind.config.js` | JS ベースのカスタマイズ設定 |
| `frontend/postcss.config.mjs` | PostCSS プラグインとして `@tailwindcss/postcss` を登録 |
| `frontend/src/app/globals.css` | `@import "tailwindcss"` + `@config` でエントリポイント |

**v4 の設定方式について:**

Tailwind v4 はデフォルトで CSS ファーストの設定（`@theme` ディレクティブ）を採用しているが、JS 設定ファイルも `@config` ディレクティブで併用できる。

`globals.css` の先頭:
```css
@import "tailwindcss";
@config "../../tailwind.config.js";
```

`tailwind.config.js` の構造:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {},
      fontFamily: {},
      spacing: {},
    },
  },
  plugins: [],
};
```

**カスタマイズの追加方法:**
- カラー・フォント・スペーシング等 → `tailwind.config.js` の `theme.extend` に追記
- グローバルな CSS 変数やベーススタイル → `globals.css` の `@theme inline` ブロックに追記
- プラグイン（例: `@tailwindcss/typography`）→ `npm install` 後に `plugins` 配列へ追加

**ダークモード:**  
`globals.css` 内の `@media (prefers-color-scheme: dark)` で `--background` / `--foreground` を切り替え。

---

## 環境変数

### `.env`（コミット可）

| 変数 | 値 | 用途 |
|------|----|------|
| `MYSQL_DATABASE` | `wordpress` | DB 名 |
| `MYSQL_USER` | `wpuser` | DB ユーザー |
| `WORDPRESS_TABLE_PREFIX` | `wp_` | テーブルプレフィックス |
| `WP_API_BASE_SERVER` | `http://wordpress` | Next.js → WP（内部通信） |
| `WP_API_BASE_PUBLIC` | `https://cms.local.test` | ブラウザ → WP（公開通信） |
| `NEXT_PUBLIC_SITE_URL` | `https://www.local.test` | サイト URL |
| `NODE_ENV` | `development` | 実行環境 |

### `.env.local`（コミット不可 / シークレット）

| 変数 | 用途 |
|------|------|
| `MYSQL_ROOT_PASSWORD` | MariaDB root パスワード |
| `MYSQL_PASSWORD` | DB ユーザーパスワード |
| `REVALIDATE_SECRET` | ISR 再検証 API の認証キー |

---

## TLS 証明書

`./certs/` に以下のファイルを配置する（`mkcert` 等で生成）:

```
certs/
├── local.test.pem
└── local.test-key.pem
```

生成例（mkcert 使用）:
```bash
mkcert -install
mkcert -cert-file certs/local.test.pem -key-file certs/local.test-key.pem "*.local.test" local.test
```

---

## ローカル環境セットアップ手順

### 1. 前提条件のインストール

以下をあらかじめインストールしておく。

| ツール | 用途 |
|--------|------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | コンテナ実行環境 |
| [mkcert](https://github.com/FiloSottile/mkcert) | ローカル HTTPS 証明書の生成 |

### 2. hosts ファイルの設定

`local.test` ドメインをループバックに向ける。

管理者権限で起動した Git Bash で実行する。

```bash
echo "127.0.0.1 www.local.test cms.local.test" >> /c/Windows/System32/drivers/etc/hosts
```

### 3. TLS 証明書の生成

```bash
# ローカル CA をシステムに信頼させる（初回のみ）
mkcert -install

# ワイルドカード証明書を certs/ に生成
mkcert -cert-file certs/local.test.pem -key-file certs/local.test-key.pem "*.local.test" local.test
```

### 4. 環境変数ファイルの作成

`.env.local` を手動作成する（`.env.local.example` は存在しない）。

```bash
cat > .env.local << 'EOF'
MYSQL_ROOT_PASSWORD=localrootpass
MYSQL_PASSWORD=wppass
REVALIDATE_SECRET=local-dev-secret-change-in-production
EOF
```

### 5. package-lock.json の生成（初回のみ）

Dockerfile の `npm ci` は `package-lock.json` を必須とするため、初回は `frontend/` でローカルインストールを実行してロックファイルを生成する。

```bash
cd frontend
npm install
cd ..
```

### 6. コンテナの起動

Docker Compose はデフォルトで `.env` のみ読み込み、`.env.local` は自動的に読み込まない。そのため起動時は必ず両方の `--env-file` を指定する。

```bash
docker compose --env-file .env --env-file .env.local up -d
```

全サービスが healthy になるまで待つ（初回は db の起動に 30 秒程度かかる）。

```bash
# 全サービスの状態確認
docker compose --env-file .env --env-file .env.local ps

# healthy になるまでログを監視する場合
docker compose --env-file .env --env-file .env.local logs -f db wordpress next
```

### 7. WordPress の初期セットアップ

1. ブラウザで `https://cms.local.test/wp-admin/install.php` を開く
2. 言語・サイト名・管理者アカウントを設定してインストール完了
3. 管理画面にログイン

### 8. パーマリンクの設定

WPGraphQL の `/graphql` エンドポイントはパーマリンクがプレーン以外でないと 404 になる。

**「設定 → パーマリンク」** で **「投稿名」** を選択して **「変更を保存」** をクリックする。

### 9. 必要プラグインの有効化

管理画面の「プラグイン → 新規追加」から以下をインストール・有効化する。

| プラグイン | 用途 |
|------------|------|
| **WPGraphQL** | `https://cms.local.test/graphql` エンドポイントを提供 |
| **Redis Object Cache** | Redis キャッシュ連携（有効化後「設定 → Redis」から「Enable Object Cache」をクリック） |
| **Custom Post Type UI（CPT UI）** | カスタム投稿タイプの作成（Show in GraphQL を有効にすれば WPGraphQL が自動公開する） |

#### カスタム投稿タイプ「お知らせ」の設定（CPT UI）

「CPT UI → 投稿タイプの追加と編集」で以下を設定して保存する。

| 項目 | 値 |
|------|----|
| 投稿タイプスラッグ | `news` |
| 複数形のラベル | `お知らせ` |
| 単数形のラベル | `お知らせ` |
| Show in GraphQL | `true` |
| GraphQL Single Name | `newsItem` |
| GraphQL Plural Name | `allNews` |

### 10. 動作確認

| 確認項目 | URL / コマンド |
|----------|----------------|
| フロントエンド表示 | `https://www.local.test` |
| WordPress 管理画面 | `https://cms.local.test/wp-admin` |
| GraphQL エンドポイント | `https://cms.local.test/graphql` |
| Traefik ダッシュボード | `http://localhost:8080` |
| ヘルスチェック | `curl https://www.local.test/health` → `{"ok":true}` |

---

## 日常的な起動・停止

```bash
# 起動
docker compose --env-file .env --env-file .env.local up -d

# 停止
docker compose --env-file .env --env-file .env.local down

# ログ確認
docker compose --env-file .env --env-file .env.local logs -f next
docker compose --env-file .env --env-file .env.local logs -f wordpress
```

---

## Docker イメージ構成（Dockerfile マルチステージ）

| ステージ | 用途 |
|----------|------|
| `deps` | `npm ci` による依存インストール |
| `dev` | ホットリロード開発サーバー（`npm run dev`） |
| `builder` | 本番ビルド（`next build`） |
| `runner` | 本番実行（`standalone` 出力 + `node server.js`） |

開発環境では `target: dev` を指定して起動する。

---

## Next.js ビルド設定

- `output: "standalone"` — 本番用に最小構成の自己完結サーバーを生成
- `allowedDevOrigins: ["www.local.test"]` — Traefik 経由（`www.local.test`）でアクセスした際の HMR クロスオリジン警告を抑制
- `images.remotePatterns` — `cms.local.test` の `/wp-content/**` を `next/image` で許可
- `tsconfig` の `strict: true` — 型チェック厳格モード
- パスエイリアス: `@/*` → `./src/*`
