// 検証済み attributes.json で本番 facilities を更新する SQL（UPDATE・非破壊）を生成。
// truncate/delete は使わない。施設名で突合し、属性列を上書き（未確認はnullに戻す）。
// 実行: node scripts/build-update.mjs  ->  supabase/update.sql
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { ROWS } from './build-facilities.mjs'

const attrs = existsSync('scripts/attributes.json')
  ? JSON.parse(readFileSync('scripts/attributes.json', 'utf8'))
  : {}

const BOOL_KEYS = [
  'has_female_doctor', 'has_sedation', 'weekend', 'quick_reservation', 'parking',
  'online_reservation', 'in_clinic_prep', 'barrier_free', 'credit_card', 'ct_colonography',
]

const sqlEsc = (s) => String(s).replace(/'/g, "''")
const sStr = (s) => (s == null ? 'null' : `'${sqlEsc(s)}'`)
const sBool = (v) => (v === true ? 'true' : 'null')

const lines = [
  '-- 検証済みデータで本番 facilities を UPDATE で上書き（非破壊・行構成は不変）',
  '-- 自動生成: scripts/build-update.mjs ／ 正本: data/attribute-evidence.json',
]
ROWS.forEach(([, name], i) => {
  const a = attrs[`tg-${i + 1}`] || {}
  const sets = [
    `website = ${sStr(a.website ?? null)}`,
    `nearest_station = ${sStr(a.nearest_station ?? null)}`,
    `walk_minutes = ${a.walk_minutes != null ? a.walk_minutes : 'null'}`,
    ...BOOL_KEYS.map((k) => `${k} = ${sBool(a[k])}`),
  ]
  lines.push(`update public.facilities set ${sets.join(', ')} where name = ${sStr(name)};`)
})

writeFileSync('supabase/update.sql', lines.join('\n') + '\n')
console.log(`wrote supabase/update.sql (${ROWS.length} updates)`)
