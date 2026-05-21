# お問い合わせフォーム 仕様書

## 概要

Next.js の Server Actions と Resend API を使用した問い合わせフォーム。
ボット対策としてハニーポットと Redis によるレート制限を実装している。

---

## ファイル構成

```
frontend/src/
├── app/
│   └── contact/
│       ├── page.tsx          # ページ（Server Component）
│       ├── ContactForm.tsx   # フォーム UI（Client Component）
│       └── actions.ts        # Server Action（バリデーション・送信処理）
└── lib/
    └── redis.ts              # Redis クライアント・レート制限ユーティリティ
```

---

## フォームフィールド

| フィールド | 名前 | 必須 | バリデーション |
|-----------|------|------|--------------|
| お名前 | `name` | ✅ | 空白チェック |
| メールアドレス | `email` | ✅ | 空白 + 正規表現チェック |
| 電話番号 | `phone` | — | なし |
| お問い合わせ内容 | `message` | ✅ | 空白チェック |
| ハニーポット | `website` | — | 非表示フィールド（ボット対策） |

---

## 処理フロー

```
ユーザーがフォーム送信
    ↓
[1] ハニーポットチェック
    website フィールドに値あり → 成功を偽装して終了（ボット）
    ↓
[2] IP レート制限チェック（Redis）
    同一 IP から 10 分間に 5 回超 → エラーを返す
    ↓
[3] バリデーション
    必須項目・メール形式チェック → 不正なら 400 エラー
    ↓
[4] Resend API 呼び出し
    RESEND_API_KEY 未設定 → コンソールに出力（開発用フォールバック）
    RESEND_API_KEY 設定済み → Resend 経由でメール送信
    ↓
成功画面を表示
```

---

## ボット対策

### ハニーポット
- `website` という名前の非表示フィールドを設置
- CSS で画面外に配置（`position: absolute; left: -9999px`）
- ボットが値を入力した場合は成功を偽装してサイレントに破棄（ボットに検知させない）

### レート制限
- 同一 IP アドレスから **10 分間に 5 回** を超えた送信をブロック
- 既存の Redis コンテナ（WordPress Object Cache と共用）を使用
- Redis が利用不可の場合はフェイルオープン（送信を許可）

---

## メール送信

### 送信サービス
[Resend](https://resend.com)（無料枠: 3,000 通/月・100 通/日）

### メール内容
| 項目 | 値 |
|------|----|
| 件名 | `【お問い合わせ】{お名前}様より` |
| From | `CONTACT_MAIL_FROM` の値 |
| To | `CONTACT_MAIL_TO` の値 |
| Reply-To | 送信者のメールアドレス |
| 形式 | HTML |

---

## 環境変数

`docker-compose.yml` の `next` サービスに以下を定義済み。値は `.env` で管理。

| 変数 | 説明 | 必須 |
|------|------|------|
| `RESEND_API_KEY` | Resend の API キー | 本番のみ必須 |
| `CONTACT_MAIL_TO` | 受信先メールアドレス | 本番のみ必須 |
| `CONTACT_MAIL_FROM` | 送信者メールアドレス | 本番のみ必須 |
| `REDIS_URL` | Redis 接続 URL | デフォルト: `redis://redis:6379` |

> `RESEND_API_KEY` が未設定の場合、メール送信はスキップされコンソールにログ出力される（開発環境向けフォールバック）。

---

## 本番運用手順

### 1. Resend でドメイン認証

`CONTACT_MAIL_FROM` に独自ドメイン（例: `noreply@cut-salon.jp`）を使うには Resend でドメイン認証が必要。

1. [resend.com/domains](https://resend.com/domains) を開く
2. 送信に使うドメインを追加
3. 表示された DNS レコード（SPF・DKIM）をドメインの DNS 設定に追加
4. 認証完了を確認

### 2. `.env` を更新

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_MAIL_TO=kazu@cut-salon.jp
CONTACT_MAIL_FROM=noreply@cut-salon.jp
```

### 3. コンテナを再作成

環境変数を変更した場合は `restart` ではなく `up -d` を使うこと。

```bash
docker compose --env-file .env --env-file .env.local up -d next
```

---

## Resend 送信数アラート

メール送信成功のたびに Redis で月次・日次の送信数をカウントし、閾値を超えた際に警告メールを `CONTACT_MAIL_TO` 宛に送信する。

| 種別 | 上限 | 警告タイミング |
|------|------|--------------|
| 日次 | 100通/日 | 85通（85%）超過時 |
| 月次 | 3,000通/月 | 2,700通（90%）超過時 |

- 同一期間中の警告送信は**1回のみ**（Redis に送信済みフラグを保持）
- Redis が停止中はアラート機能が無効になる（フェイルオープン）
- 警告メールの送信失敗はコンソールにログ出力されるが、ユーザーへのエラーには影響しない

### Redis キー

| キー | 内容 | 有効期限 |
|------|------|--------|
| `resend:monthly:YYYY-MM` | 月次送信数 | 35日 |
| `resend:daily:YYYY-MM-DD` | 日次送信数 | 48時間 |
| `resend:warned:monthly:YYYY-MM` | 月次警告済みフラグ | 35日 |
| `resend:warned:daily:YYYY-MM-DD` | 日次警告済みフラグ | 48時間 |

---

## 制限事項

| 項目 | 内容 |
|------|------|
| Resend 無料枠 | 3,000 通/月・100 通/日。超過時は有料プランが必要 |
| ドメイン未認証時 | `onboarding@resend.dev` からしか送れず、Resend 登録アドレス宛のみ受信可能 |
| レート制限 | Redis が停止中はレート制限が無効になる（フェイルオープン） |
