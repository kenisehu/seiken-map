// 栃木県「大腸がん検診精密検査医療機関 登録名簿」(R7.8.25現在) を
// data/facilities.csv（Supabaseインポート用）と
// src/data/tochigiFacilities.ts（アプリ同梱データ）の両方に出力する。
//
// 施設データの一次ソースはこのファイルの ROWS（PDFから転記）。
// 実行: node scripts/build-facilities.mjs
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

export const SOURCE_URL =
  'https://www.city.nasushiobara.tochigi.jp/material/files/group/21/daityouseimitukensa3.pdf'
export const PREF = '栃木県'

// [市町, 医療機関名, 住所(市以下), 電話番号]  ※PDF登録名簿のとおり
export const ROWS = [
  ['宇都宮市', '宇都宮記念病院', '宇都宮市大通り1-3-16', '028-622-1991'],
  ['宇都宮市', '宇都宮肛門・胃腸クリニック', '宇都宮市大寛1-1-7', '028-634-0151'],
  ['宇都宮市', '宇都宮第一病院', '宇都宮市宝木本町2313', '028-665-5111'],
  ['宇都宮市', '宇都宮東病院', '宇都宮市平出町368-8', '028-664-1551'],
  ['宇都宮市', 'NHO栃木医療センター', '宇都宮市中戸祭1-10-37', '028-622-5241'],
  ['宇都宮市', '大和田内科・循環器科・胃腸科', '宇都宮市雀の宮4-3-14', '028-653-0798'],
  ['宇都宮市', 'かんけクリニック', '宇都宮市宿郷2-8-5', '028-633-6201'],
  ['宇都宮市', '栃木県立がんセンター', '宇都宮市陽南4-9-13', '028-658-5151'],
  ['宇都宮市', '済生会宇都宮病院', '宇都宮市竹林町911-1', '028-626-5500'],
  ['宇都宮市', 'JCHOうつのみや病院', '宇都宮市南高砂町11-17', '028-653-1001'],
  ['宇都宮市', 'たからぎ胃腸外科クリニック', '宇都宮市宝木町1-2588-6', '028-643-6000'],
  ['宇都宮市', 'よしざわクリニック', '宇都宮市台新田1-2-25', '028-658-6111'],
  ['宇都宮市', '宇都宮セントラルクリニック', '宇都宮市屋板町561-3', '028-657-7300'],
  ['宇都宮市', '宇都宮消化器・内視鏡内科クリニック', '宇都宮市下砥上町691-4', '028-615-1001'],
  ['足利市', '足利赤十字病院', '足利市五十部町284-1', '0284-21-0121'],
  ['足利市', '大岡胃腸内科', '足利市花園町4-2', '0284-41-1177'],
  ['足利市', 'かめいクリニック', '足利市堀込町2760-1', '0284-70-6607'],
  ['足利市', '筑波医院', '足利市羽刈町57', '0284-71-1633'],
  ['足利市', '長崎病院', '足利市伊勢町1-4-7', '0284-41-2230'],
  ['足利市', '本庄記念病院', '足利市堀込町2859', '0284-73-1199'],
  ['足利市', '皆川病院', '足利市多田木町1168-1', '0284-91-2188'],
  ['足利市', 'うるしばらクリニック', '足利市借宿町610-7', '0284-70-7177'],
  ['足利市', '小野内科消化器科医院', '足利市旭町851-4', '0284-22-3730'],
  ['足利市', '伏島クリニック', '足利市朝倉町3-3-1', '0284-70-3085'],
  ['栃木市', '江田クリニック', '栃木市岩舟町小野寺2575-7', '0282-57-1234'],
  ['栃木市', 'とちぎメディカルセンターしもつが', '栃木市大平町川連420-1', '0282-22-2551'],
  ['栃木市', 'なかつぼクリニック', '栃木市箱森町36-2', '0282-20-5252'],
  ['栃木市', 'なんぱクリニック', '栃木市平井町219-5', '0282-24-7787'],
  ['栃木市', '西方病院', '栃木市西方町金崎273-3', '0282-92-2323'],
  ['栃木市', '大平ファミリークリニック', '栃木市大平町富田5-229', '0282-43-7500'],
  ['栃木市', '小松原医院', '栃木市岩舟町静550-2', '0282-55-2026'],
  ['栃木市', '腰塚医院', '栃木市藤岡町藤岡1845-10', '0282-62-2072'],
  ['栃木市', 'みずほクリニック', '栃木市大平町牛久99-2', '0282-25-1222'],
  ['佐野市', '佐野医師会病院', '佐野市植上町1677', '0283-22-5358'],
  ['佐野市', '佐野厚生総合病院', '佐野市堀米町1728', '0283-22-5222'],
  ['佐野市', '佐野市民病院', '佐野市田沼町1832-1', '0283-62-5111'],
  ['鹿沼市', '宇賀神内科外科', '鹿沼市久保町1618-5', '0289-60-6300'],
  ['鹿沼市', '上都賀総合病院', '鹿沼市下田町1-1033', '0289-64-2161'],
  ['鹿沼市', '御殿山病院', '鹿沼市今宮町1682-2', '0289-64-2131'],
  ['鹿沼市', '宮司外科胃腸科', '鹿沼市府所町119-1', '0289-62-6222'],
  ['日光市', '足尾双愛病院', '日光市足尾町砂畑4147-2', '0288-93-2011'],
  ['日光市', '今市病院', '日光市今市381', '0288-22-2200'],
  ['日光市', '本町内科クリニック', '日光市吉沢239-9', '0288-25-3120'],
  ['日光市', '獨協医科大学日光医療センター', '日光市森友145-1', '0288-23-7000'],
  ['小山市', '青木医院', '小山市網戸1850', '0285-45-5545'],
  ['小山市', '暁クリニック', '小山市犬塚62', '0285-24-6868'],
  ['小山市', '新小山市民病院', '小山市神鳥谷2251-1', '0285-36-0200'],
  ['小山市', '城南クリニック', '小山市西城南2-18-7', '0285-28-7780'],
  ['真岡市', '高橋内科歯科クリニック', '真岡市西郷170-1', '0285-84-7580'],
  ['真岡市', '芳賀赤十字病院', '真岡市中郷2-10-1', '0570-01-2195'],
  ['真岡市', '福田記念病院', '真岡市並木町3-10-6', '0285-84-1171'],
  ['真岡市', '真岡病院', '真岡市荒町3-45-16', '0285-84-6311'],
  ['真岡市', '柳田外科肛門科医院', '真岡市台町15-3', '0285-82-5525'],
  ['大田原市', '那須赤十字病院', '大田原市中田原1081-4', '0287-23-1122'],
  ['大田原市', '那須中央病院', '大田原市下石上1453', '0287-29-2121'],
  ['大田原市', '増山胃腸科クリニック', '大田原市加治屋83-413', '0287-23-6321'],
  ['大田原市', '河島クリニック', '大田原市中央2-9-32', '0287-20-1192'],
  ['矢板市', '尾形クリニック', '矢板市末広町45-3', '0287-43-2230'],
  ['矢板市', '国際医療福祉大学塩谷病院', '矢板市富田77', '0287-44-1155'],
  ['那須塩原市', '小沼内科胃腸科クリニック', '那須塩原市西朝日町6-42', '0287-37-5353'],
  ['那須塩原市', '菅間記念病院', '那須塩原市大黒町2-5', '0287-62-0733'],
  ['那須塩原市', '滝田メディカルクリニック', '那須塩原市本町9-26', '0287-62-0392'],
  ['那須塩原市', '緑の杜クリニック', '那須塩原市大原間西1-6-7', '0287-67-3339'],
  ['さくら市', '黒須病院', 'さくら市氏家2650', '028-682-8811'],
  ['さくら市', '花塚クリニック', 'さくら市喜連川841-1', '028-686-7667'],
  ['さくら市', '根本医院', 'さくら市櫻野1250', '028-682-2800'],
  ['那須烏山市', '那須南病院', '那須烏山市中央3-2-13', '0287-84-3911'],
  ['下野市', '石橋総合病院', '下野市下古山1-15-4', '0285-53-1134'],
  ['下野市', '小金井中央病院', '下野市小金井2-4-3', '0285-44-7000'],
  ['下野市', '自治医科大学附属病院', '下野市薬師寺3311-1', '0285-44-2111'],
  ['壬生町', '獨協医科大学病院', '壬生町北小林880', '0282-86-1111'],
  ['高根沢町', '高根沢中央病院', '高根沢町光陽台3-16-1', '028-675-1133'],
  ['高根沢町', '菅又病院', '高根沢町大字花岡2351', '028-676-0311'],
]

const CSV_COLUMNS = [
  'name', 'municipality', 'address', 'lat', 'lng', 'phone', 'website',
  'nearest_station', 'walk_minutes', 'has_female_doctor', 'has_sedation',
  'weekend', 'quick_reservation', 'parking', 'online_reservation',
  'in_clinic_prep', 'barrier_free', 'credit_card', 'ct_colonography',
  'exam_types', 'form_note', 'source_url', 'verified',
]

const csvEscape = (s) => (/[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s)

export const fullAddress = (row) => PREF + row[2]

// scripts/coords.json（geocode.mjs が生成）: { [住所]: { lat, lng } }
function loadCoords() {
  const p = 'scripts/coords.json'
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {}
}

function generate() {
  const coords = loadCoords()
  const csvLines = [CSV_COLUMNS.join(',')]
  const tsItems = []
  let withCoords = 0

  ROWS.forEach(([muni, name, addr, phone], i) => {
    const address = PREF + addr
    const c = coords[address]
    const lat = c ? c.lat : null
    const lng = c ? c.lng : null
    if (c) withCoords++

    const cols = [
      name, muni, address,
      lat == null ? '' : String(lat),
      lng == null ? '' : String(lng),
      phone, '', '', '', '', '', '', '', '', '', '', '', '', '',
      '{大腸内視鏡}', '', SOURCE_URL, 'TRUE',
    ]
    csvLines.push(cols.map(csvEscape).join(','))

    tsItems.push(`  {
    id: 'tg-${i + 1}',
    name: ${JSON.stringify(name)},
    municipality: ${JSON.stringify(muni)},
    address: ${JSON.stringify(address)},
    lat: ${lat == null ? 'null' : lat},
    lng: ${lng == null ? 'null' : lng},
    phone: ${JSON.stringify(phone)},
    website: null,
    nearest_station: null,
    walk_minutes: null,
    has_female_doctor: null,
    has_sedation: null,
    weekend: null,
    quick_reservation: null,
    parking: null,
    online_reservation: null,
    in_clinic_prep: null,
    barrier_free: null,
    credit_card: null,
    ct_colonography: null,
    exam_types: ['大腸内視鏡'],
    form_note: null,
    source_url: ${JSON.stringify(SOURCE_URL)},
    verified: true,
  },`)
  })

  writeFileSync('data/facilities.csv', csvLines.join('\n') + '\n')

  const ts = `import type { Facility } from '../types'

// 栃木県「大腸がん検診精密検査医療機関 登録名簿」(R7.8.25現在) より ${ROWS.length}施設
// 出典PDF: ${SOURCE_URL}
// このファイルは scripts/build-facilities.mjs で自動生成。直接編集しないこと。
export const TOCHIGI_FACILITIES: Facility[] = [
${tsItems.join('\n')}
]
`
  writeFileSync('src/data/tochigiFacilities.ts', ts)

  // Supabase用シード（CSVインポートの代わりに SQL Editor で実行できる）
  const sqlEsc = (s) => String(s).replace(/'/g, "''")
  const seedVals = ROWS.map(([muni, name, addr, phone]) => {
    const address = PREF + addr
    const c = coords[address]
    return `  ('${sqlEsc(name)}','${sqlEsc(muni)}','${sqlEsc(address)}',${c ? c.lat : 'null'},${c ? c.lng : 'null'},'${sqlEsc(phone)}','{大腸内視鏡}','${SOURCE_URL}',true)`
  }).join(',\n')
  const seed = `-- 栃木県登録名簿 ${ROWS.length}施設のシードデータ
-- migration 0001 を適用後、SQL Editor で一度だけ実行する（再実行は重複するので注意）。
-- 自動生成: scripts/build-facilities.mjs ／ 出典: ${SOURCE_URL}
insert into public.facilities
  (name, municipality, address, lat, lng, phone, exam_types, source_url, verified)
values
${seedVals}
;
`
  writeFileSync('supabase/seed.sql', seed)

  console.log(
    `wrote ${ROWS.length} facilities (${withCoords} with coords) -> data/facilities.csv, src/data/tochigiFacilities.ts, supabase/seed.sql`,
  )
}

// 直接実行されたときだけ生成（geocode.mjs からのimport時は実行しない）
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  generate()
}
