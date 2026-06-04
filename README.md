# 精検実施機関マップ

大腸がん検診（便潜血検査）で陽性だった方が、精密検査（大腸内視鏡）を受けられる医療機関を探せるWebアプリ。

技術スタック：**React + Vite + TypeScript / Supabase / Vercel（無料枠）**。地図ライブラリは使わず、リスト主体＋Googleマップリンク。

詳細仕様は [`HANDOFF.md`](./HANDOFF.md) を参照。

## データの範囲について（重要）

当初は4市（那須塩原市・所沢市・久喜市・武蔵野市）のパイロットを想定していたが、**精密検査（大腸内視鏡）の実施医療機関リストを公開しているのは栃木県のみ**だった（所沢・久喜・武蔵野＝埼玉/東京は市・県とも非公開で、精検機関は陽性者に個別通知する運用）。

そこで、唯一の公開かつ権威ある一次ソースである **栃木県「大腸がん検診精密検査医療機関 登録名簿」（県内16市町・73施設）** を採用している。

- 一次ソース（PDF）: `https://www.city.nasushiobara.tochigi.jp/material/files/group/21/daityouseimitukensa3.pdf`（那須塩原市が掲載、栃木県登録、R7.8.25現在）
- 名称・住所・電話・出典は実在。フィルター属性（女性医師・鎮静等）は名簿に無いため初期値は **未確認（null）**。Googleフォーム/公式サイトで順次補完する。

## クイックスタート

```bash
npm install
npm run dev      # http://localhost:5173
```

`.env` が未設定でも、同梱の栃木県データ（`src/data/tochigiFacilities.ts`、73施設）でUIが動く。Supabase接続後はDBのデータを表示。

## データ生成（CSV / アプリ同梱データ）

施設データの一次ソースは [`scripts/build-facilities.mjs`](./scripts/build-facilities.mjs) 内の `ROWS`（登録名簿PDFから転記）。

```bash
node scripts/geocode.mjs            # 住所→緯度経度（国土地理院, 無料・キー不要）。scripts/coords.json にキャッシュ
node scripts/build-facilities.mjs   # ROWS + coords.json から下記を生成
#  -> data/facilities.csv            （Supabase CSVインポート用）
#  -> supabase/seed.sql              （SQL Editorで流し込む用）
#  -> src/data/tochigiFacilities.ts  （アプリ同梱フォールバック）
```

名簿が更新されたら `ROWS` を直して再生成する（CSV・SQL・アプリデータが常に一致する）。

## Supabase 接続

1. Supabaseでプロジェクトを作成。
2. `supabase/migrations/0001_init.sql` を **SQL Editor** で実行（3テーブル＋RLS）。
3. `.env.example` を `.env` にコピーし、Project Settings → API の値を設定：
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. データ投入（どちらか）:
   - **かんたん**：`supabase/seed.sql` を SQL Editor で実行（73施設を一括INSERT・座標入り）。一度だけ。
   - **CSV派**：`data/facilities.csv` を Table Editor → `facilities` → Import data via CSV。
     - boolean は `TRUE` / `FALSE` / 空欄（=未確認 / null）。
     - `exam_types` はPostgres配列リテラルで `"{大腸内視鏡,便潜血再検}"`（ダブルクォート必須）。
     - 文字コードは **UTF-8** で保存。不明な属性は空欄、`source_url` は必ず残す。

## 属性の補完（Googleフォーム）

`data/import_template.csv` は施設アンケート回収・手入力用テンプレ（ヘッダは `facilities` のカラム名と一致）。回収 → CSV → Supabaseへインポートで属性を埋めていく。

## 計測（events）

QRやリンクのURLに `?src=qr&muni=...` を付けると、初回表示時に `qr_access` を記録する。

```
https://<本番URL>/?src=qr&muni=nasushiobara
```

`muni` の例：`nasushiobara` / `utsunomiya` / `ashikaga` / `oyama` ほか（`src/types.ts` の `MUNI_SLUGS` 参照）。
ほかに電話タップ（`phone_tap`）、詳細閲覧（`detail_view`）を記録。集計はSupabase管理画面で。

## 未対応・次の候補

- 緯度経度は国土地理院ジオコーダで取得済み（街区レベルの概算・73件全件）。「現在地から近い順」は稼働する。精度が気になる施設は `scripts/coords.json` を直して再生成、または手修正。
- レビューは承認制・選択式のみ・自由記述カラムなし（医療広告ガイドライン／誹謗中傷対策）。RLSで匿名投稿は `approved=false` 固定、表示は承認済みのみ。
- 患者ログイン／お気に入りなし。日本語のみ。スマホ優先。免責表示は全ページのフッターに常時表示。

## デプロイ（Vercel）

- `git push` で自動デプロイ（Vercel連携後）。
- Vercel の Environment Variables に `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` を設定。
- SPAルーティングは `vercel.json` の rewrites で対応済み。

## ディレクトリ

```
src/
  components/   UI部品（カード・フィルター・レビュー等）
  pages/        ListPage（一覧） / FacilityDetailPage（詳細）
  lib/          supabase, facilities, reviews, events, geo, filters
  data/         tochigiFacilities.ts（同梱データ）/ dummyReviews.ts
  types.ts      ドメイン型
scripts/        build-facilities.mjs（データ生成）
supabase/migrations/  SQLマイグレーション
data/                 facilities.csv（実データ）/ import_template.csv
```
