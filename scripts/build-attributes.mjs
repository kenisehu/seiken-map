// data/attribute-evidence.json（根拠の正本）から scripts/attributes.json を生成する。
// 「evidence に url+quote がある属性 = 公式サイトで裏が取れた」だけを true にする。
// 実行: node scripts/build-attributes.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const BOOL_KEYS = [
  'has_female_doctor', 'has_sedation', 'weekend', 'quick_reservation', 'parking',
  'online_reservation', 'in_clinic_prep', 'barrier_free', 'credit_card', 'ct_colonography',
]

const ev = JSON.parse(readFileSync('data/attribute-evidence.json', 'utf8'))
const out = {}
let sites = 0
let attrs = 0

for (const [id, e] of Object.entries(ev)) {
  if (id.startsWith('_')) continue
  const o = {}
  if (e.website) {
    o.website = e.website
    sites++
  }
  if (e.nearest_station) o.nearest_station = e.nearest_station
  if (e.walk_minutes != null) o.walk_minutes = e.walk_minutes
  const evidence = e.evidence || {}
  for (const k of BOOL_KEYS) {
    if (evidence[k]) {
      o[k] = true
      attrs++
    }
  }
  out[id] = o
}

writeFileSync('scripts/attributes.json', JSON.stringify(out, null, 2) + '\n')
console.log(`derived scripts/attributes.json from evidence: sites=${sites}, true-attrs=${attrs}`)
