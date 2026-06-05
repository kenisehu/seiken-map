// 各施設のフィルター属性の「出典（根拠）」台帳を生成する。
// 属性は各施設の公式サイト記載分のみ登録しているため、出典＝公式サイトURL。
// 実行: node scripts/build-sources.mjs  ->  data/attribute-sources.md
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { ROWS } from './build-facilities.mjs'

const attrs = existsSync('scripts/attributes.json')
  ? JSON.parse(readFileSync('scripts/attributes.json', 'utf8'))
  : {}

const LABELS = {
  has_female_doctor: '女性医師',
  has_sedation: '鎮静対応',
  weekend: '土日対応',
  quick_reservation: '当日・翌日可',
  parking: '駐車場',
  online_reservation: 'ネット予約',
  in_clinic_prep: '院内前処置',
  barrier_free: 'バリアフリー',
  credit_card: 'カード可',
  ct_colonography: '大腸CT',
}
const BOOL_KEYS = Object.keys(LABELS)

let withSite = 0
let attrCount = 0

let md = `# フィルター属性の出典（根拠）

最終更新：自動生成（\`node scripts/build-sources.mjs\`）

## 方針
- **名称・住所・電話・緯度経度**の出典：栃木県「大腸がん検診精密検査医療機関 登録名簿」（一次ソース）。
- **フィルター属性**（鎮静・駐車場・土日 等）の出典：**各施設の公式サイト**に記載がある内容のみを「対応あり」として登録。記載が確認できないものは空欄（＝未確認、憶測しない）。
- したがって各属性の一次的な根拠は、下記の各施設「出典（公式サイト）」のURLです。
- ※「サイトのどの文・どのページが根拠か」までの逐語記録が必要な場合は、各サイトを再読して該当箇所を引用する追加パスで対応します（このファイルはURLレベルの台帳）。

`

let curMuni = ''
ROWS.forEach(([muni, name], i) => {
  const id = `tg-${i + 1}`
  const a = attrs[id] || {}
  if (muni !== curMuni) {
    md += `\n## ${muni}\n`
    curMuni = muni
  }
  md += `\n### ${name}\n`
  if (a.website) {
    md += `- 出典（公式サイト）: ${a.website}\n`
    withSite++
  } else {
    md += `- 公式サイト: 特定できず（属性は未登録）\n`
  }
  if (a.nearest_station) {
    md += `- 最寄り駅: ${a.nearest_station}${a.walk_minutes != null ? `・徒歩${a.walk_minutes}分` : ''}\n`
  }
  const trues = BOOL_KEYS.filter((k) => a[k] === true)
  attrCount += trues.length
  if (trues.length) {
    md += `- 「対応あり」と公式サイトに記載: ${trues.map((k) => LABELS[k]).join(' / ')}\n`
  } else if (a.website) {
    md += `- 「対応あり」と明記された属性: なし（電話確認／フォームで補完予定）\n`
  }
})

md += `\n---\n\n出典サイトを特定できた施設：${withSite} / ${ROWS.length}。属性「対応あり」の総数：${attrCount} 件。\n`

writeFileSync('data/attribute-sources.md', md)
console.log(`wrote data/attribute-sources.md (sites=${withSite}/${ROWS.length}, true-attrs=${attrCount})`)
