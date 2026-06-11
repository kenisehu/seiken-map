# 📌 引継ぎ記録（最新の実装状況）

最終更新：2026-06-05
> 新しい担当者／別セッションが続きをやれるようにまとめた現状記録。**まずここを読む。** 当初の要件定義はこの下（「— 引き継ぎ書（プロジェクト仕様）」以降）に保存してあるが、一部は実装で変わっている（下記）。詳しいレビュー・判断事項は [STATUS.md](STATUS.md)。

## 当初構想からの主な変更
- **対象エリア**：当初4市（那須市/所沢/久喜/武蔵野）→ **栃木県（登録名簿73施設）に変更**。理由：精検実施機関リストを公開しているのは栃木県のみで、所沢/久喜/武蔵野は市・県とも非公開だった（那須塩原市は栃木県名簿に含まれる）。
- **市町UI**：タブ → **プルダウン**。フィルターは「詳細/通常」の区別を撤廃し**全項目チェックボックスを常時表示**。
- レビュー方針（選択式・承認制・自由記述なし）は変更なし。

## いま動いているもの（URL・資産）
- 本番（公開）: **https://seiken-map.vercel.app**
- GitHub（公開）: **https://github.com/kenisehu/seiken-map** … `main` へ `git push` で**自動デプロイ**（Vercel連携済み）
- Supabase: project ref **`rcxhsdlsaotsjkhowblx`**（東京）。テーブル facilities/reviews/events、RLS有効
- ローカル: `npm run dev` → http://localhost:5173

## 技術スタック / 構成
- React + Vite + TypeScript。**地図ライブラリ無し**（Googleマップリンク）。react-router（`/`一覧・`/facility/:id`詳細）。
- データ取得 `src/lib/facilities.ts`：Supabase接続時はDB、未接続時は同梱 `src/data/tochigiFacilities.ts` にフォールバック。
- 環境変数：`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`（publishable key）。ローカル `.env`（git除外）＋ Vercel Production env に設定済み。

## 主要ファイル
- `src/pages/` ListPage（一覧/検索/現在地ソート/フィルタ）, FacilityDetailPage（詳細/電話テンプレ/バッジ/レビュー）
- `src/components/` Filters（市町プルダウン＋チェックボックス）, FacilityCard, ReviewForm/ReviewSummary, CallTemplate, DisclaimerFooter
- `src/lib/` supabase, facilities, reviews, events, geo, filters
- `supabase/` migrations/0001_init.sql（スキーマ＋RLS）, seed.sql（初回投入）, update.sql（属性更新）
- `data/` facilities.csv, import_template.csv（フォーム回収用）, **attribute-evidence.json（属性の根拠＝正本）**, attribute-sources.md（根拠台帳）
- `scripts/` build-facilities.mjs, geocode.mjs, build-update.mjs, build-sources.mjs, attributes.json/coords.json（中間データ）
- `docs/google-form.md`（施設アンケート設計）, `STATUS.md`（レビュー・判断事項）

## データの作り方・更新（重要）
一次ソースと生成フロー：
1. 名簿（名称/住所/電話）= `scripts/build-facilities.mjs` の `ROWS`（栃木県登録名簿PDFから転記）。
2. 緯度経度 = `node scripts/geocode.mjs`（国土地理院・無料。`scripts/coords.json` にキャッシュ）。
3. 属性の**根拠** = `data/attribute-evidence.json`（公式サイトのURL＋引用。**ここが正本**）。属性の**値** = `scripts/attributes.json`（生成器が読む）。
4. 生成 = `node scripts/build-facilities.mjs` → `data/facilities.csv` / `supabase/seed.sql` / `src/data/tochigiFacilities.ts`。
5. 根拠台帳 = `node scripts/build-sources.mjs` → `data/attribute-sources.md`。
6. DB反映：
   - 初回投入 = `supabase/seed.sql` を SQL Editor で実行。
   - 属性だけ更新 = `node scripts/build-update.mjs` → `supabase/update.sql` を SQL Editor で実行（UPDATE・非破壊）。

⚠️ 次の担当者への注意：
- 属性は「**公式サイトに明記がある分だけ true、不明は null（憶測しない）**」が鉄則。
- 属性を直すときは `data/attribute-evidence.json`（根拠）と `scripts/attributes.json`（値）の**両方**を整合させる。現状この2つは手で同期（**evidence→attributes の自動生成スクリプトが未整備＝TODO**。作ると安全）。
- 名簿が更新されたら `ROWS` を直して再生成。

## デプロイ
- `git push origin main` で本番自動デプロイ。または `vercel deploy --prod`。
- Vercel Production env に Supabase 2値が必要（設定済み）。SPA fallback は `vercel.json`。

## 運用タスク
- **レビュー承認**：reviews は `approved=false` で入る。Supabase Table Editor で `approved=true` にすると表示（RLSで未承認は非表示）。
- **計測集計**：events（qr_access/phone_tap/detail_view）。匿名insert可・読取はサービスロール/管理画面。
- **QR計測**：配布URLに `?src=qr&muni=<slug>`（slug は `src/types.ts` の MUNI_SLUGS）。
- **属性の補完**：`docs/google-form.md` のフォームで施設から回収 → DB更新。

## 制約・ポリシー（厳守）
- レビュー：承認制・選択式のみ・**自由記述カラムを作らない**（医療広告ガイドライン/誹謗中傷対策）。
- データ：オール実在・憶測で埋めない・不明はnull・出典を残す（名簿＝source_url、属性＝公式サイト）。
- 患者ログイン無し・お気に入り無し・スマホ優先・日本語のみ・免責フッター常時表示。

## 残課題・判断事項
→ **[STATUS.md](STATUS.md)** 参照（属性trueの抜き取り確認、掲載の法務/倫理、エリア拡張、フォーム運用、evidence→attributes自動化 など）。

---

# 精検実施機関マップ — 引き継ぎ書（プロジェクト仕様）

最終更新：2026-06-04（当初の要件定義。参考。一部は上記のとおり実装で変更）
作成：要件定義の壁打ち（ブラウザ版 Claude）→ 実装は Claude Code へ引き継ぎ

---

## 0. このプロジェクトは何か

大腸がん検診（便潜血検査）で**陽性**だった人が、**精密検査（大腸内視鏡）を受けられる近隣の医療機関を自分で探せる**Webアプリ。

患者の動線の中での位置づけ：

```
便潜血 陽性通知の紙（自治体発行）
  └─ QRコード
       └─ ショートムービー（患者の声：放置経験者インタビュー等）
            └─「陽性結果を受け取った日に見るページ」
                 └─【このアプリ】近くの精密検査ができる病院を探す（即リスト表示）
```

このアプリは上記ページ内の一機能だが、独立したWebアプリとして実装し、リンク/iframe等で組み込める形にする。**今回作るのは「即リスト表示」のマップ部分**。冒頭の安心メッセージ等は親ページ側が持つので、このアプリは開いたら即リストでよい。

### 運営主体・スタンス
- 将来はコロレクペディア（医師・看護師・患者団体）の正式プロダクト化を想定。**まずは個人開発**。
- **私的な市民活動（非公式）**。免責表示を必ず入れる（後述）。

---

## 1. 対象エリア（パイロット4市）

以下4市町村の精検実施機関を**網羅**することを目指す：

| 自治体 | 選定理由 |
|---|---|
| 那須市（栃木県） | コロレクペディア代表が現在勤務 |
| 所沢市（埼玉県） | 開発者の居住地 |
| 久喜市（埼玉県） | 大腸がん検診を議会質問した大橋きよみ議員の選挙区 |
| 武蔵野市（東京都） | 同上・大野あつ子議員の選挙区 |

### データソースの定義
- 各自治体が公表している「**がん検診精密検査実施医療機関リスト**」を一次ソースとする。
- リストに載っている施設を全件収録（リスト外の開業医までは広げない）。
- 最低限集める項目：名称・住所・電話番号・緯度経度。
- フィルター属性（女性医師・鎮静等）は公式サイトで分かる範囲を埋め、**残りは後述のGoogleフォームで施設に直接照会**する二段構え。
- データは**オール実在**。最終チェックは人間（開発者）が行う。

### データ収集の進め方（Claude Code側のタスク）
- MCP / Chrome 等を使って各自治体サイトの精検実施機関リストを探し、施設情報を収集する。
- 各施設の公式サイトも確認し、分かる範囲で属性を補う。
- 収集結果はCSV（後述スキーマ）に整形して `data/` に置く。

---

## 2. 技術スタック

既存プロジェクト（フリーランスの右腕 等）と統一：

- フロント：**React + Vite + TypeScript**
- DB / バックエンド：**Supabase**
- ホスティング：**Vercel（無料枠）**
- 地図：**専用ライブラリは使わない。** リスト主体 ＋ 各施設に Google マップへのリンク（緯度経度 or 住所で `https://www.google.com/maps/search/?api=1&query=...`）
- ローカル開発：`npm run dev`、デプロイは `git push`（既存の標準ワークフロー）

---

## 3. 画面構成

### 3-1. メイン（リスト＋フィルター）画面 ＝ 起点
- 開いたら**即リスト表示**（安心メッセージ等は親ページが持つので不要）
- 上部：タイトル「精検実施機関マップ」＋ごく短い説明（例：便潜血が陽性だった方へ。大腸内視鏡を受けられる医療機関です）
- フィルターチップ（横スクロール／折りたたみ）
- 住所・駅名での検索ボックス
- 現在地から近い順の並べ替え（GPS。許可されなければ未ソート or 自治体選択）
- 施設カードのリスト

### 3-2. 施設詳細ページ
- 施設名・住所・電話・地図リンク
- 対応バッジ一覧（フィルター属性をすべて表示）
- 「予約電話」ボタン（タップで発信／計測対象）
- **「予約電話で言うべきこと」テンプレ**（例：「健診の便潜血検査で陽性だったので、大腸内視鏡の精密検査をお願いしたいです」）を目立つ位置に。
- Googleフォームで施設から回収した情報（前処置の説明、補足コメント等）を表示
- レビュー（承認済みのみ・選択式のみ・自由記述なし）の集計表示

### 3-3. （管理は最小限）
- ログイン機能なし（患者側）。
- レビュー承認や施設データ更新は、当面 Supabase の管理画面 or CSVインポートで運用（専用管理画面は作らない）。

---

## 4. フィルター項目（全部入れる方針）

コア5つ＋追加候補をすべて採用：

1. 女性医師あり
2. 鎮静対応（眠っている間に受けられる）
3. 土日対応
4. 当日・翌日予約可
5. 駐車場あり
6. ネット予約可（予約方法）
7. 院内前処置対応（下剤を院内で飲める）
8. 車椅子・バリアフリー対応
9. クレジットカード可
10. 最寄り駅から徒歩◯分以内（距離フィルター）
11. 大腸CT / CTコロノグラフィ対応（内視鏡が難しい人向けの選択肢）
12. 精検の種類フィルター：大腸内視鏡／便潜血再検 等で絞れるように

※多すぎるとUIが疲れるので、**コア5つを常時表示・残りは「詳細フィルター」で開閉**する設計を推奨。

---

## 5. データスキーマ（Supabase）

### facilities（医療機関）
| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | |
| name | text | 医療機関名 |
| municipality | text | 那須市/所沢市/久喜市/武蔵野市 |
| address | text | 住所 |
| lat | float8 | 緯度 |
| lng | float8 | 経度 |
| phone | text | 電話番号 |
| website | text | 公式サイトURL（任意） |
| nearest_station | text | 最寄り駅（任意） |
| walk_minutes | int | 駅から徒歩分（任意） |
| has_female_doctor | bool | 女性医師あり |
| has_sedation | bool | 鎮静対応 |
| weekend | bool | 土日対応 |
| quick_reservation | bool | 当日・翌日予約可 |
| parking | bool | 駐車場あり |
| online_reservation | bool | ネット予約可 |
| in_clinic_prep | bool | 院内前処置対応 |
| barrier_free | bool | 車椅子・バリアフリー |
| credit_card | bool | クレジットカード可 |
| ct_colonography | bool | 大腸CT対応 |
| exam_types | text[] | 対応する精検種類 |
| form_note | text | Googleフォームで施設から回収した補足 |
| source_url | text | 出典（自治体リストのURL） |
| verified | bool | 人間チェック済みフラグ |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### reviews（レビュー：選択式・自由記述なし・承認制）
| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | |
| facility_id | uuid (FK) | |
| sedation_comfort | int | 鎮静の楽さ（1-5 or 選択肢） |
| staff_kindness | int | 説明の丁寧さ（1-5） |
| wait_time | int | 待ち時間の満足度（1-5） |
| approved | bool | 承認フラグ（デフォルトfalse） |
| created_at | timestamptz | |

※**自由記述カラムは持たない**（誹謗中傷・医療広告ガイドライン対策）。

### events（計測）
| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | |
| event_type | text | 'qr_access' / 'phone_tap' / 'detail_view' 等 |
| facility_id | uuid | phone_tap時など（任意） |
| municipality | text | 任意 |
| created_at | timestamptz | |

---

## 6. 計測要件

- **QR経由のアクセス数**（パイロット効果測定用）。QRのURLに `?src=qr&muni=tokorozawa` 等のパラメータを付け、初回表示時に `events` へ記録。
- **電話番号がタップされた回数**（`phone_tap` イベント）。施設別に集計できるように `facility_id` を持たせる。
- 詳細ページ閲覧数など、軽く取れるものは取る。

---

## 7. Googleフォーム連携

- 掲載施設にGoogleフォームのアンケートを送り、フィルター属性や補足コメントを回収する。
- フォーム回答 → スプレッドシート → **CSVエクスポート → Supabaseへインポート**（手動運用が基本線）。
- 件数が増えて手作業が重くなったら自動化を検討（今回は手動でOK）。
- CSVインポート用に、`facilities` のカラム名と一致するヘッダのテンプレCSVを `data/import_template.csv` として用意する。

---

## 8. レビュー機能（軽量・安全設計）

- **承認制**：投稿は `approved=false` で入り、承認後のみ表示。
- **自由記述なし**：選択式（鎮静の楽さ・説明の丁寧さ・待ち時間など）のみ。
- 集計値（平均）を施設詳細に表示。件数が少ない施設は「まだ口コミがありません」。
- 投稿フォームはログイン不要だが、連投・なりすまし対策として簡易な制限（同一端末の連続投稿抑制等）を検討。

---

## 9. 対応環境・その他

- **スマホ優先**、PCでも崩れず見られるレスポンシブ。
- 多言語対応：当面**日本語のみ**。
- 免責表示（フッター等に常時）：
  > 本サービスは私的な市民活動として運営されており、掲載情報の正確性・最新性を保証するものではありません。受診の前に、必ず各医療機関へ直接ご確認ください。
- 「便潜血陽性＝大腸がん確定ではない」旨は親ページが担うが、アプリ側にも一言あってよい。

---

## 10. スコープ管理（今回やる / やらない）

**やる**
- 4市の実在施設データ収集（CSV化）
- リスト＋フィルター＋検索＋現在地ソート
- 施設詳細ページ（電話テンプレ・バッジ・フォーム補足・レビュー集計）
- 計測（QRアクセス・電話タップ）
- レビュー投稿（選択式・承認制）
- Vercelデプロイ

**やらない（今回は）**
- 地図ライブラリ描画（Googleマップリンクで代替）
- 患者ログイン／お気に入り
- 専用管理画面（Supabase管理画面で運用）
- フォーム→DBの完全自動同期
- 多言語

---

## 11. 既知の論点・注意

- 医療機関の口コミは医療広告ガイドライン等に触れうるため、レビューは選択式・承認制を厳守。
- フィルター属性は公式サイトに載らないことが多く、初期は空欄が多い前提。フォーム回収で埋めていく。
- 「網羅」の鮮度は自治体リスト依存。`source_url` と取得日を残し、更新できるようにする。
- 4市はリストの公開形式がバラバラ（PDF/HTML/Excel）の可能性大。収集時に整形が要る。
