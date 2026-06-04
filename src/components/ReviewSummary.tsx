import type { ReviewAggregate } from '../types'

interface ReviewSummaryProps {
  aggregate: ReviewAggregate
}

const METRICS: { key: keyof ReviewAggregate; label: string }[] = [
  { key: 'sedation_comfort', label: '鎮静の楽さ' },
  { key: 'staff_kindness', label: '説明の丁寧さ' },
  { key: 'wait_time', label: '待ち時間の満足度' },
]

export default function ReviewSummary({ aggregate }: ReviewSummaryProps) {
  if (aggregate.count === 0) {
    return (
      <section className="reviews-summary">
        <h3 className="section-title">口コミ</h3>
        <p className="reviews-empty">まだ口コミがありません。</p>
      </section>
    )
  }

  return (
    <section className="reviews-summary">
      <h3 className="section-title">口コミ（承認済み {aggregate.count} 件の集計）</h3>
      <div className="metric-list">
        {METRICS.map(({ key, label }) => {
          const value = aggregate[key] as number | null
          return (
            <div className="metric" key={key}>
              <span className="metric-label">{label}</span>
              <div className="metric-bar">
                <div
                  className="metric-bar-fill"
                  style={{ width: value != null ? `${(value / 5) * 100}%` : '0%' }}
                />
              </div>
              <span className="metric-value">{value != null ? value.toFixed(1) : '—'}</span>
            </div>
          )
        })}
      </div>
      <p className="reviews-note">※選択式アンケート（5段階）の平均です。自由記述は扱っていません。</p>
    </section>
  )
}
