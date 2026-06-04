import { useState } from 'react'
import Chip from './Chip'
import { CORE_FILTERS, EXTRA_FILTERS, type BoolKey } from '../lib/filters'
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

export default function Filters({ state, municipalities, onChange }: FiltersProps) {
  const [showExtra, setShowExtra] = useState(false)

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
      {/* 自治体 */}
      <div className="chip-row" role="group" aria-label="自治体で絞り込み">
        <Chip active={state.municipality === 'all'} onClick={() => onChange({ municipality: 'all' })}>
          すべての地域
        </Chip>
        {municipalities.map((m) => (
          <Chip key={m} active={state.municipality === m} onClick={() => onChange({ municipality: m })}>
            {m}
          </Chip>
        ))}
      </div>

      {/* コア5フィルター（常時表示） */}
      <div className="chip-row" role="group" aria-label="主要な条件で絞り込み">
        {CORE_FILTERS.map((f) => (
          <Chip key={f.key} active={state.bools.includes(f.key)} onClick={() => toggleBool(f.key)}>
            {f.short}
          </Chip>
        ))}
      </div>

      {/* 詳細フィルター 開閉 */}
      <div className="filters-toolbar">
        <button
          type="button"
          className="filters-toggle"
          aria-expanded={showExtra}
          onClick={() => setShowExtra((v) => !v)}
        >
          {showExtra ? '詳細フィルターを閉じる ▲' : '詳細フィルター ▼'}
        </button>
        {activeCount > 0 && (
          <button type="button" className="filters-clear" onClick={() => onChange(EMPTY_FILTERS)}>
            条件をクリア（{activeCount}）
          </button>
        )}
      </div>

      {showExtra && (
        <div className="filters-extra">
          <div className="chip-row chip-row--wrap" role="group" aria-label="その他の条件">
            {EXTRA_FILTERS.map((f) => (
              <Chip key={f.key} active={state.bools.includes(f.key)} onClick={() => toggleBool(f.key)}>
                {f.short}
              </Chip>
            ))}
          </div>

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

          <div className="filters-field">
            <span className="filters-label">精密検査の種類</span>
            <div className="chip-row chip-row--wrap">
              {EXAM_TYPES.map((t) => (
                <Chip key={t} active={state.examTypes.includes(t)} onClick={() => toggleExam(t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
