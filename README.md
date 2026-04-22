# House Maker Web プロジェクト

このプロジェクトは、住宅メーカー（渡部工務店）の公式ウェブサイトおよび社内用管理システム（CMS）のソースコードです。
フロントエンドは Next.js、バックエンドは FastAPI (Python) を使用して構築されています。

## セキュリティ対応状況

| 項目 | 状態 | 詳細 |
|------|------|------|
| `.env`のGit除外 | ✅ | `.gitignore`で除外済み |
| CORS制限 | ✅ | `ALLOWED_ORIGINS`環境変数で制御 |
| レート制限 | ✅ | 全API（5〜30回/分）に適用済み |
| JWT認証 | ✅ | 管理者API全体をJWT保護 |
| セキュリティヘッダー | ✅ | X-Content-Type-Options等を付与 |
| 入力バリデーション | ✅ | 全エンドポイントの入力に制約を適用 |
| 画像URLインジェクション対策 | ✅ | `https?://`以外のURLを拒否 |
| ログインジェクション対策 | ✅ | ログ出力前に`repr()`でサニタイズ |
| 公開APIのDoS対策 | ✅ | limitキャップ（最大100件）とレート制限 |
| SMTP TLS証明書検証 | ✅ | `ssl.create_default_context()`で有効化 |
| Swagger UI本番公開 | ✅ | 本番キー使用時は自動で無効化 |
| 例外処理（CRUD API） | ✅ | DB操作すべてにtry/exceptとロールバックを追加 |
| 管理者トークン保管場所 | ⚠️ | `localStorage`使用（XSSリスクあり。将来的にHttpOnly Cookie化を推奨） |
| node_modulesのGit除外 | ✅ | `.gitignore`で除外済み |

## 概要

### 一般公開サイト (Frontend)
- **URL**: `http://localhost:3000`
- **技術スタック**: Next.js, React, CSS Modules
- **機能**:
  - トップページ（ヒーロー画像、コンセプト、ギャラリー、確かな技術）
  - **施工事例 (`/works`)**: バックエンドAPIから取得した施工事例をギャラリー形式で表示。APIエラー時もクラッシュせず安全にフォールバックします。
  - **展示場案内 (`/showrooms`)**: Googleマップ連携によるアクセス情報の提供。
  - **会社概要 (`/company`)**: 代表メッセージおよび企業情報。
  - **お問い合わせ (`/#contact`)**: レート制限とバリデーションを備えたお問い合わせフォーム。

### 管理者ダッシュボード (Frontend - Admin)
- **URL**: `http://localhost:3000/admin/login`
- **アクセス**: 認証必須（JWTトークンによるアクセス制御）
- **機能**:
  - **ダッシュボード**: システム全体の概要表示。
  - **お知らせ管理**: サイト内のお知らせ（ニュース）の追加・削除（CMS機能）。
  - **施工事例管理**: 施工事例（画像URL、所在地、価格帯など）の追加・削除（CMS機能）。
  - **お問い合わせ管理**: お客様からのお問い合わせの閲覧、既読ステータスの変更、削除。

### バックエンド API (Backend)
- **URL**: `http://localhost:8000`
- **技術スタック**: Python, FastAPI, SQLAlchemy, MySQL, slowapi
- **機能**:
  - `GET /api/works`, `/api/news`: 一般公開用のデータ取得API。
  - `POST /api/contact`: お問い合わせ送信エンドポイント。
  - `/api/admin/*`: 管理者用CRUDエンドポイント（JWT認証必須）。
  - **自動返信メール**: お問い合わせ受付時に `BackgroundTasks` を用いて非同期で受付完了メールを送信します（現在はテストモードでコンソール出力）。

---

## 環境構築と起動方法

### 前提条件
- Node.js (v18+)
- Python 3.10+
- MySQL Server

### 1. データベースの準備
MySQLでデータベースを作成します。
```sql
CREATE DATABASE housemaker_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. バックエンドのセットアップと起動
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windowsの場合
pip install -r requirements.txt
```

`.env` ファイルを作成（または編集）し、以下の変数を設定します：
```env
# MySQL設定
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=あなたのパスワード
MYSQL_DATABASE=housemaker_db

# 管理者情報とJWT設定
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Vh7pEXMU0eR2M2h.  # 'admin123'のハッシュ
JWT_SECRET_KEY=任意のシークレットキー

# CORS設定
ALLOWED_ORIGINS=http://localhost:3000

# SMTP設定 (空の場合はコンソールに出力するテストモードになります)
SMTP_SERVER=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
```

サーバーを起動します：
```bash
uvicorn main:app --reload
```
※初回起動時、自動的にデータベースのテーブル（contacts, news, works）が作成されます。

### 3. フロントエンドのセットアップと起動
```bash
cd frontend-next
npm install
```

`.env.local` ファイルを作成（または編集）します：
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

開発サーバーを起動します：
```bash
npm run dev
```
ブラウザで `http://localhost:3000` にアクセスしてください。

---

## 運用上の注意事項（トラブルシューティング）

### 1. `works.map is not a function` エラーについて
バックエンドサーバーが停止している、またはAPIが `404 Not Found` などのエラーレスポンスを返した場合、フロントエンドが配列以外のデータ（エラーオブジェクト等）を受け取ることがあります。
**対応済**: フロントエンド側でレスポンスが配列 (`Array.isArray`) であるかをチェックするロジックを追加し、APIエラー時でもクラッシュせずに「施工事例はありません」と表示されるよう修正されています。

### 2. `.env` ファイルのエンコーディング
バックエンドの `.env` ファイルに日本語などのマルチバイト文字が含まれていると、起動時に `UnicodeDecodeError` が発生する場合があります。
**対策**: `.env` ファイルは必ず **UTF-8（BOMなし）** または **ASCII** で保存してください。

### 3. 初期管理者パスワードの変更
初期状態の管理者パスワードは `admin123` に設定されています。
本番環境へデプロイする際は、必ず新しいパスワードのbcryptハッシュを生成し、`.env` の `ADMIN_PASSWORD_HASH` を更新してください。
ハッシュの生成例:
```bash
python -c "from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('新しいパスワード'))"
```

### 4. 自動返信メールの実運用
現在はテストモードのため、お問い合わせフォームから送信された内容はバックエンドのコンソールログに出力されます。実際にメールを送信するには、`.env` に有効なSMTPサーバーの情報を設定してください。