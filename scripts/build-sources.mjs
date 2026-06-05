// 各施設のフィルター属性の「根拠台帳」を生成する（引用つき）。
// data/attribute-evidence.json（正本）から、属性ごとに URL＋引用を一覧化。
// 実行: node scripts/build-sources.mjs  ->  data/attribute-sources.md
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { ROWS } from './build-facilities.mjs'

const ev = existsSync('data/attribute-evidence.json')
  ? JSON.parse(readFileSync('data/attribute-evidence.json', 'utf8'))
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

let sites = 0
let attrCount = 0

let md = `# フィルター属性の根拠台帳

最終更新：自動生成（\`node scripts/build-sources.mjs\`、正本 \`data/attribute-evidence.json\`）

## 方針
- **名称・住所・電話・緯度経度**の出典：栃木県「大腸がん検診精密検査医療機関 登録名簿」（一次ソース）。
- **フィルター属性**：各施設の**公式サイト**に明記があり、該当ページURLと引用で裏が取れたものだけを「対応あり」として登録。確認できないものは未登録（＝未確認、憶測しない）。
- 下記は各属性の根拠（出典URL＋引用）です。

`

let curMuni = ''
ROWS.forEach(([muni, name], i) => {
  const id = `tg-${i + 1}`
  const e = ev[id] || {}
  const evidence = e.evidence || {}
  if (muni !== curMuni) {
    md += `\n## ${muni}\n`
    curMuni = muni
  }
  md += `\n### ${name}\n`
  if (e.website) {
    md += `- 出典（公式サイト）: ${e.website}\n`
    sites++
  } else {
    md += `- 公式サイト: 特定できず（属性は未登録）\n`
  }
  if (e.nearest_station) {
    const st = evidence.nearest_station
    md += `- 最寄り駅: ${e.nearest_station}${e.walk_minutes != null ? `・徒歩${e.walk_minutes}分` : ''}`
    md += st ? ` ┈ 「${st.quote}」（${st.url}）\n` : `\n`
  }
  const trues = BOOL_KEYS.filter((k) => evidence[k])
  attrCount += trues.length
  if (trues.length) {
    md += `- 対応ありと確認した項目:\n`
    for (const k of trues) {
      const x = evidence[k]
      md += `    - **${LABELS[k]}**: 「${x.quote}」 ┈ ${x.url}\n`
    }
  } else if (e.website) {
    md += `- 対応ありと確認できた項目: なし（電話確認／フォームで補完予定）\n`
  }
  if (e.note) md += `- 備考: ${e.note}\n`
})

md += `\n---\n\n出典サイトを特定できた施設：${sites} / ${ROWS.length}。根拠つきで「対応あり」とした属性：${attrCount} 件。\n`

writeFileSync('data/attribute-sources.md', md)
console.log(`wrote data/attribute-sources.md (sites=${sites}/${ROWS.length}, true-attrs=${attrCount})`)
