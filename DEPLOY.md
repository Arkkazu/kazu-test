# 本番デプロイマニュアル

## 構成概要

| 項目 | 内容 |
|------|------|
| フロントエンド URL | https://www.kazu-test.com |
| CMS URL | https://cms.kazu-test.com |
| サーバー | Xserver VPS（Ubuntu 24.04 / 2GB RAM / 3vCPU / 50GB SSD） |
| IP アドレス | 85.131.248.47 |
| コンテナ管理 | Docker Compose（docker-compose.prod.yml） |
| TLS 証明書 | Let's Encrypt（Traefik が自動取得・更新） |
| SSH 鍵 | `~/.ssh/xvps`（ed25519） |
| GitHub リポジトリ | https://github.com/taneArai/kazu-test |

### サービス構成

```
[ブラウザ]
    |
[Traefik v3]  :80(→443リダイレクト) / :443(TLS終端・Let's Encrypt)
    |                    |
[next :3000]      [wordpress :80]
                         |         |
                      [redis]    [db(MariaDB)]
```

---

## 前提条件

- Xserver VPS 契約済み・SSH 接続可能
- `kazu-test.com` の DNS A レコードが VPS IP に向いている
- ローカルに SSH 秘密鍵 `~/.ssh/xvps` がある
- Docker・Docker Compose が VPS にインストール済み

---

## 1. Xserver VPS の初期セットアップ（初回のみ）

### 1-1. SSH 鍵の作成（PC 側）

```powershell
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\xvps" -N ""
Get-Content "$env:USERPROFILE\.ssh\xvps.pub"
```

表示された公開鍵を Xserver VPS パネルの **「SSH Key」→「SSH Keyの登録」** に貼り付けて保存する。

### 1-2. OS インストール時に SSH 鍵を適用する

> **重要:** SSH 鍵はパネルへの「登録」だけでは VPS に反映されない。
> **OS インストール時に鍵を選択する**ことで初めて `/root/.ssh/authorized_keys` に書き込まれる。

Xserver VPS パネル → VPS 管理 → **「OS再インストール」**
- OS: Ubuntu 24.04
- SSH キー: 登録した鍵を選択
- root パスワード: 任意の強力なパスワードを設定

### 1-3. SSH 接続確認

```bash
ssh -i ~/.ssh/xvps root@85.131.248.47 "echo 接続成功"
```

### 1-4. Docker のインストール

```bash
ssh -i ~/.ssh/xvps root@85.131.248.47 bash << 'EOF'
apt-get update -q
apt-get install -y -q ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list
apt-get update -q
apt-get install -y -q docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
docker --version && docker compose version
EOF
```

---

## 2. ファイルの転送

> **注意:** `scp -r` は `node_modules` を転送しようとして失敗・遅延する原因になる。
> 必ず `tar` でまとめてから転送すること。

### 2-1. サーバーにディレクトリを作成

```bash
ssh -i ~/.ssh/xvps root@85.131.248.47 "mkdir -p /srv/kazu-test2"
```

### 2-2. ファイルを tar で圧縮して転送・展開

```bash
# ローカルで圧縮（node_modules・.next・data・certs を除外）
cd /path/to/kazu-test2
tar --exclude=frontend/node_modules \
    --exclude=frontend/.next \
    --exclude=data \
    --exclude=certs \
    -czf /tmp/kazu-test2.tar.gz \
    docker-compose.prod.yml traefik frontend

# サーバーに転送して展開
scp -i ~/.ssh/xvps /tmp/kazu-test2.tar.gz root@85.131.248.47:/srv/kazu-test2/
ssh -i ~/.ssh/xvps root@85.131.248.47 \
  "cd /srv/kazu-test2 && tar -xzf kazu-test2.tar.gz && rm kazu-test2.tar.gz"
```

### 2-3. 転送内容の確認

```bash
ssh -i ~/.ssh/xvps root@85.131.248.47 "ls /srv/kazu-test2/ && ls /srv/kazu-test2/frontend/"
```

以下が揃っていることを確認する：

```
/srv/kazu-test2/
├── docker-compose.prod.yml
├── traefik/
│   ├── traefik.prod.yml
│   └── dynamic/
└── frontend/
    ├── Dockerfile
    ├── package.json          ← 必須
    ├── package-lock.json     ← 必須
    ├── next.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── postcss.config.mjs
    ├── src/
    └── public/
```

---

## 3. 環境変数ファイルの作成

サーバー上で直接作成する。

### 3-1. .env（公開可能な設定値）

```bash
ssh -i ~/.ssh/xvps root@85.131.248.47 "cat > /srv/kazu-test2/.env << 'EOF'
MYSQL_DATABASE=wordpress
MYSQL_USER=wpuser
WORDPRESS_TABLE_PREFIX=wp_
WP_API_BASE_SERVER=http://wordpress
WP_API_BASE_PUBLIC=https://cms.kazu-test.com
NEXT_PUBLIC_SITE_URL=https://www.kazu-test.com
NODE_ENV=production
EOF"
```

### 3-2. .env.local（シークレット）

```bash
ssh -i ~/.ssh/xvps root@85.131.248.47 "cat > /srv/kazu-test2/.env.local << 'EOF'
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 24)
MYSQL_PASSWORD=$(openssl rand -base64 24)
REVALIDATE_SECRET=$(openssl rand -base64 32)
EOF
cat /srv/kazu-test2/.env.local"
```

> **重要:** 表示されたパスワードを安全な場所に保管すること。

---

## 4. 起動

```bash
ssh -i ~/.ssh/xvps root@85.131.248.47 \
  "cd /srv/kazu-test2 && docker compose -f docker-compose.prod.yml --env-file .env --env-file .env.local up -d --build"
```

Next.js の本番ビルドに **3〜5 分**かかる。

### 起動確認

```bash
ssh -i ~/.ssh/xvps root@85.131.248.47 \
  "cd /srv/kazu-test2 && docker compose -f docker-compose.prod.yml --env-file .env --env-file .env.local ps"
```

全サービスが `healthy` または `Up` になっていることを確認する。

```
NAME                     STATUS
kazu-test2-db-1          Up (healthy)
kazu-test2-redis-1       Up (healthy)
kazu-test2-wordpress-1   Up
kazu-test2-next-1        Up (healthy)
kazu-test2-traefik-1     Up
```

---

## 5. WordPress 初期セットアップ

1. `https://cms.kazu-test.com/wp-admin/install.php` を開く
2. 言語・サイト名・管理者アカウントを設定してインストール
3. **設定 → パーマリンク → 「投稿名」** を選択して保存
4. **プラグイン → 新規追加** から以下をインストール・有効化：

| プラグイン | 用途 |
|------------|------|
| WPGraphQL | GraphQL エンドポイント |
| Redis Object Cache | Redis キャッシュ連携（有効化後「設定 → Redis」→「Enable Object Cache」） |
| Custom Post Type UI | カスタム投稿タイプ管理（Show in GraphQL を有効にすれば WPGraphQL が自動公開） |

5. カスタム投稿タイプ「お知らせ」を CPT UI で設定（SPEC.md 参照）

---

## 6. 動作確認

| 確認項目 | URL |
|----------|-----|
| フロントエンド | https://www.kazu-test.com |
| WordPress 管理画面 | https://cms.kazu-test.com/wp-admin |
| GraphQL エンドポイント | https://cms.kazu-test.com/graphql |

---

## 7. コードを更新した場合の再デプロイ

GitHub 経由でデプロイする（推奨）。

```bash
# 1. ローカルで変更をコミット・プッシュ
git add .
git commit -m "変更内容"
git push origin main

# 2. サーバーで pull してビルド
ssh -i ~/.ssh/xvps root@85.131.248.47 \
  "cd /srv/kazu-test2 && git pull origin main && \
   docker compose -f docker-compose.prod.yml --env-file .env --env-file .env.local up -d --build next"
```

> **注意:** サーバー上の `.env`・`.env.local`・`data/` は git 管理外のため `git pull` しても上書きされない。

---

## 8. 日常的な操作

```bash
# ログ確認
ssh -i ~/.ssh/xvps root@85.131.248.47 \
  "cd /srv/kazu-test2 && docker compose -f docker-compose.prod.yml logs -f next"

# 全サービス再起動
ssh -i ~/.ssh/xvps root@85.131.248.47 \
  "cd /srv/kazu-test2 && docker compose -f docker-compose.prod.yml --env-file .env --env-file .env.local restart"

# 停止
ssh -i ~/.ssh/xvps root@85.131.248.47 \
  "cd /srv/kazu-test2 && docker compose -f docker-compose.prod.yml --env-file .env --env-file .env.local down"

# フェッチキャッシュのクリア（WordPress 側の変更が反映されない場合）
# CPT UI での GraphQL 設定変更後など、Next.js がエラーレスポンスをキャッシュしている場合に使用
ssh -i ~/.ssh/xvps root@85.131.248.47 \
  "docker exec kazu-test2-next-1 rm -rf /app/.next/cache/fetch-cache && \
   cd /srv/kazu-test2 && docker compose -f docker-compose.prod.yml --env-file .env --env-file .env.local restart next"
```

---

## 9. 既知の問題と解決策

| 問題 | 原因 | 解決策 |
|------|------|--------|
| SSH 接続できない（Permission denied） | 鍵が OS インストール時に未適用 | OS 再インストール時に SSH 鍵を選択する |
| ビルドエラー: `Cannot find package.json` | `scp -r` で転送が不完全 | tar でまとめて転送する |
| ビルドエラー: WordPress 接続失敗 | ビルド中は WordPress コンテナが存在しない | `generateStaticParams` を try-catch で囲み空配列を返す |
| ヘルスチェック失敗（next が unhealthy） | standalone サーバーが `0.0.0.0` にバインドしない | `HOSTNAME=0.0.0.0` を環境変数に設定する |
| TypeScript ビルドエラー（revalidateTag） | Next.js 16 の型定義変更 | `next.config.ts` に `typescript: { ignoreBuildErrors: true }` を追加 |
| CPT UI 設定後も `allNews` エラーが続く | Next.js のフェッチキャッシュが古いエラーレスポンスを保持している | キャッシュを削除してから再起動（下記「フェッチキャッシュのクリア」参照） |
