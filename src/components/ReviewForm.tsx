import { useState } from 'react'
import { submitReview, hasSubmitted, type SubmitResult } from '../lib/reviews'

type MetricKey = 'sedation_comfort' | 'staff_kindness' | 'wait_time'

const QUESTIONS: { key: MetricKey; label: string; low: string; high: string }[] = [
  { key: 'sedation_comfort', label: '鎮静の楽さ', low: 'つらかった', high: 'とても楽だった' },
  { key: 'staff_kindness', label: '説明の丁寧さ', low: '物足りない', high: 'とても丁寧' },
  { key: 'wait_time', label: '待ち時間', low: '長かった', high: '短く快適' },
]

const SCALE = [1, 2, 3, 4, 5]

interface ReviewFormProps {
  facilityId: string
}

export default function ReviewForm({ facilityId }: ReviewFormProps) {
  const [values, setValues] = useState<Record<MetricKey, number | null>>({
    sedation_comfort: null,
    staff_kindness: null,
    wait_time: null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [done, setDone] = useState(hasSubmitted(facilityId))

  const setValue = (key: MetricKey, v: number) => {
    setValues((prev) => ({ ...prev, [key]: prev[key] === v ? null : v }))
  }

  const submit = async () => {
    const anyAnswered = Object.values(values).some((v) => v != null)
    if (!anyAnswered) {
      setResult({ ok: false, message: '1つ以上選んでから投稿してください。' })
      return
    }
    setSubmitting(true)
    const res = await submitReview({ facility_id: facilityId, ...values })
    setResult(res)
    setSubmitting(false)
    if (res.ok) setDone(true)
  }

  if (done) {
    return (
      <section className="review-form">
        <h3 className="section-title">口コミを投稿</h3>
        <p className="review-thanks">
          {result?.message ?? 'この施設には投稿済みです。ご協力ありがとうございました。'}
        </p>
      </section>
    )
  }

  return (
    <section className="review-form">
      <h3 className="section-title">口コミを投稿（選択式・承認制）</h3>
      <p className="review-form-note">
        実際に受診された方向けの選択式アンケートです。記入は任意、自由記述はありません。
        投稿は内容確認後に掲載されます。
      </p>

      {QUESTIONS.map((q) => (
        <div className="review-q" key={q.key}>
          <span className="review-q-label">{q.label}</span>
          <div className="review-scale" role="group" aria-label={q.label}>
            {SCALE.map((n) => (
              <button
                key={n}
                type="button"
                className={`review-dot${values[q.key] === n ? ' review-dot--active' : ''}`}
                aria-pressed={values[q.key] === n}
                aria-label={`${q.label} ${n}`}
                onClick={() => setValue(q.key, n)}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="review-scale-ends">
            <span>{q.low}</span>
            <span>{q.high}</span>
          </div>
        </div>
      ))}

      {result && (
        <p className={`review-result${result.ok ? ' review-result--ok' : ' review-result--err'}`}>
          {result.message}
        </p>
      )}

      <button type="button" className="btn btn--primary" disabled={submitting} onClick={submit}>
        {submitting ? '送信中…' : '投稿する'}
      </button>
    </section>
  )
}
