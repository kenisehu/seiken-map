// 施設住所 → 緯度経度 を国土地理院ジオコーダで取得し scripts/coords.json に保存。
// 無料・APIキー不要。結果はキャッシュし、再実行時は未取得分のみ問い合わせる。
// 実行: node scripts/geocode.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { ROWS, fullAddress } from './build-facilities.mjs'

const CACHE = 'scripts/coords.json'
const GSI = 'https://msearch.gsi.go.jp/address-search/AddressSearch?q='
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {}

let ok = 0
let fail = 0
let skipped = 0
const failed = []

for (const row of ROWS) {
  const [, name] = row
  const address = fullAddress(row)
  if (cache[address]) {
    skipped++
    continue
  }
  try {
    const res = await fetch(GSI + encodeURIComponent(address), {
      headers: { 'User-Agent': 'seiken-map-geocoder/1.0 (personal civic project)' },
    })
    const data = await res.json()
    const coords = Array.isArray(data) && data[0]?.geometry?.coordinates
    if (coords && coords.length === 2) {
      const [lng, lat] = coords
      cache[address] = { lat, lng }
      ok++
      console.log(`ok   ${name}  ${lat},${lng}`)
    } else {
      fail++
      failed.push(`${name} / ${address}`)
      console.warn(`MISS ${name}  ${address}`)
    }
  } catch (e) {
    fail++
    failed.push(`${name} / ${address} (${e.message})`)
    console.warn(`ERR  ${name}  ${address}  ${e.message}`)
  }
  await sleep(200) // 礼儀として ~5req/sec 以下
}

writeFileSync(CACHE, JSON.stringify(cache, null, 2) + '\n')
console.log(`\ngeocoded ok=${ok} miss/err=${fail} skipped=${skipped}, total cached=${Object.keys(cache).length}/${ROWS.length}`)
if (failed.length) {
  console.log('--- 未取得（手動で lat/lng 要確認）---')
  failed.forEach((f) => console.log('  ' + f))
}
