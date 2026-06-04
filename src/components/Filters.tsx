import Chip from './Chip'
import { FILTER_DEFS, type BoolKey } from '../lib/filters'
import { EXAM_TYPES, type Municipality, type ExamType } from '../types'

export interface FilterState {
  search: string
  municipality: Municipality | 'all'
  bools: BoolKey[]
  walkMax: number | null
  examTypes: ExamType[]
}

export const EMPTY_FILTERS: FilterState = {
  search: '',
  municipality: 'all',
  bools: [],
  walkMax: null,
  examTypes: [],
}

interface FiltersProps {
  state: FilterState
  municipalities: string[]
  onChange: (patch: Partial<FilterState>) => void
}

const WALK_OPTIONS = [5, 10, 15]

function CheckItem({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="check-label">{label}</span>
    </label>
  )
}

export default function Filters({ state, municipalities, onChange }: FiltersProps) {
  const toggleBool = (key: BoolKey) => {
    const next = state.bools.includes(key)
      ? state.bools.filter((k) => k !== key)
      : [...state.bools, key]
    onChange({ bools: next })
  }

  const toggleExam = (t: ExamType) => {
    const next = state.examTypes.includes(t)
      ? state.examTypes.filter((x) => x !== t)
      : [...state.examTypes, t]
    onChange({ examTypes: next })
  }

  const activeCount =
    state.bools.length +
    state.examTypes.length +
    (state.municipality !== 'all' ? 1 : 0) +
    (state.walkMax != null ? 1 : 0) +
    (state.search ? 1 : 0)

  return (
    <div className="filters">
      {/* 市町プルダウン */}
      <div className="filters-field">
        <label className="filters-label" htmlFor="muni-select">
          市町でしぼる
        </label>
        <select
          id="muni-select"
          className="muni-select"
          value={state.municipality}
          onChange={(e) => onChange({ municipality: e.target.value })}
        >
          <option value="all">すべての地域</option>
          {municipalities.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* 対応・設備（チェックボックス・全項目） */}
      <div className="filters-field">
        <span className="filters-label">対応・設備でしぼる</span>
        <div className="check-grid">
          {FILTER_DEFS.map((f) => (
            <CheckItem
              key={f.key}
              checked={state.bools.includes(f.key)}
              onChange={() => toggleBool(f.key)}
              label={f.short}
            />
          ))}
        </div>
      </div>

      {/* 最寄り駅 */}
      <div className="filters-field">
        <span className="filters-label">最寄り駅から</span>
        <div className="chip-row chip-row--wrap">
          <Chip active={state.walkMax == null} onClick={() => onChange({ walkMax: null })}>
            指定なし
          </Chip>
          {WALK_OPTIONS.map((min) => (
            <Chip key={min} active={state.walkMax === min} onClick={() => onChange({ walkMax: min })}>
              徒歩{min}分以内
            </Chip>
          ))}
        </div>
      </div>

      {/* 精密検査の種類 */}
      <div className="filters-field">
        <span className="filters-label">精密検査の種類</span>
        <div className="check-grid">
          {EXAM_TYPES.map((t) => (
            <CheckItem
              key={t}
              checked={state.examTypes.includes(t)}
              onChange={() => toggleExam(t)}
              label={t}
            />
          ))}
        </div>
      </div>

      {activeCount > 0 && (
        <button type="button" className="filters-clear filters-clear--block" onClick={() => onChange(EMPTY_FILTERS)}>
          条件をクリア（{activeCount}）
        </button>
      )}
    </div>
  )
}
