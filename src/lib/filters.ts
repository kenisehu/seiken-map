import type { Facility } from '../types'

export type BoolKey =
  | 'has_female_doctor'
  | 'has_sedation'
  | 'weekend'
  | 'quick_reservation'
  | 'parking'
  | 'online_reservation'
  | 'in_clinic_prep'
  | 'barrier_free'
  | 'credit_card'
  | 'ct_colonography'

export interface FilterDef {
  key: BoolKey
  /** 詳細ページのバッジ用フルラベル */
  label: string
  /** フィルターチップ用の短いラベル */
  short: string
  /** コア5項目（常時表示）か */
  core: boolean
}

export const FILTER_DEFS: FilterDef[] = [
  { key: 'has_female_doctor', label: '女性医師あり', short: '女性医師', core: true },
  { key: 'has_sedation', label: '鎮静対応（眠っている間に受けられる）', short: '鎮静対応', core: true },
  { key: 'weekend', label: '土日対応', short: '土日対応', core: true },
  { key: 'quick_reservation', label: '当日・翌日予約可', short: '当日・翌日可', core: true },
  { key: 'parking', label: '駐車場あり', short: '駐車場', core: true },
  { key: 'online_reservation', label: 'ネット予約可', short: 'ネット予約', core: false },
  { key: 'in_clinic_prep', label: '院内前処置対応（下剤を院内で飲める）', short: '院内前処置', core: false },
  { key: 'barrier_free', label: '車椅子・バリアフリー対応', short: 'バリアフリー', core: false },
  { key: 'credit_card', label: 'クレジットカード可', short: 'カード可', core: false },
  { key: 'ct_colonography', label: '大腸CT / CTコロノグラフィ対応', short: '大腸CT', core: false },
]

export const CORE_FILTERS = FILTER_DEFS.filter((f) => f.core)
export const EXTRA_FILTERS = FILTER_DEFS.filter((f) => !f.core)

/** その属性が「対応あり(true)」の施設だけ通す。null/false は除外。 */
export function matchesBool(facility: Facility, key: BoolKey): boolean {
  return facility[key] === true
}
