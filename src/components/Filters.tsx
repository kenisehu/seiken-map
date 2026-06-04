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
      {/* 市町タブ */}
      <div className="tabs" role="tablist" aria-label="市町で絞り込み">
        <button
          type="button"
          role="tab"
          aria-selected={state.municipality === 'all'}
          className={`tab${state.municipality === 'all' ? ' tab--active' : ''}`}
          onClick={() => onChange({ municipality: 'all' })}
        >
          すべて
        </button>
        {municipalities.map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={state.municipality === m}
            className={`tab${state.municipality === m ? ' tab--active' : ''}`}
            onClick={() => onChange({ municipality: m })}
          >
            {m}
          </button>
        ))}
      </div>

      {/* コア条件（チェックボックス・常時表示） */}
      <div className="check-grid" role="group" aria-label="主要な条件で絞り込み">
        {CORE_FILTERS.map((f) => (
          <CheckItem
            key={f.key}
            checked={state.bools.includes(f.key)}
            onChange={() => toggleBool(f.key)}
            label={f.short}
          />
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
          <div className="filters-field">
            <span className="filters-label">その他の対応</span>
            <div className="check-grid">
              {EXTRA_FILTERS.map((f) => (
                <CheckItem
                  key={f.key}
                  checked={state.bools.includes(f.key)}
                  onChange={() => toggleBool(f.key)}
                  label={f.short}
                />
              ))}
            </div>
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
        </div>
      )}
    </div>
  )
}
