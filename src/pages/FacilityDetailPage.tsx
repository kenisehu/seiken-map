import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import CallTemplate from '../components/CallTemplate'
import ReviewSummary from '../components/ReviewSummary'
import ReviewForm from '../components/ReviewForm'
import { fetchFacility } from '../lib/facilities'
import { fetchReviewAggregate } from '../lib/reviews'
import { recordEvent } from '../lib/events'
import { mapsUrl } from '../lib/geo'
import { FILTER_DEFS } from '../lib/filters'
import type { Facility, ReviewAggregate } from '../types'

export default function FacilityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [facility, setFacility] = useState<Facility | null | undefined>(undefined)
  const [aggregate, setAggregate] = useState<ReviewAggregate | null>(null)
  const recorded = useRef(false)

  useEffect(() => {
    if (!id) return
    let alive = true
    fetchFacility(id).then((f) => {
      if (!alive) return
      setFacility(f)
      if (f && !recorded.current) {
        recorded.current = true
        recordEvent({ event_type: 'detail_view', facility_id: f.id, municipality: f.municipality })
      }
    })
    fetchReviewAggregate(id).then((a) => {
      if (alive) setAggregate(a)
    })
    return () => {
      alive = false
    }
  }, [id])

  if (facility === undefined) {
    return (
      <div className="detail-page">
        <BackLink />
        <p className="list-status">読み込み中…</p>
      </div>
    )
  }

  if (facility === null) {
    return (
      <div className="detail-page">
        <BackLink />
        <p className="list-status">医療機関が見つかりませんでした。</p>
      </div>
    )
  }

  const onPhoneTap = () => {
    recordEvent({ event_type: 'phone_tap', facility_id: facility.id, municipality: facility.municipality })
  }

  return (
    <div className="detail-page">
      <BackLink />

      <header className="detail-header">
        <h1 className="detail-name">{facility.name}</h1>
        <div className="detail-meta">
          <span className="card-muni">{facility.municipality}</span>
          {facility.nearest_station && (
            <span>
              {facility.nearest_station}
              {facility.walk_minutes != null ? `・徒歩${facility.walk_minutes}分` : ''}
            </span>
          )}
        </div>
        <p className="detail-address">{facility.address}</p>
        <a className="detail-maplink" href={mapsUrl(facility)} target="_blank" rel="noreferrer">
          🗺 Googleマップで開く
        </a>
      </header>

      <div className="detail-actions">
        <a className="btn btn--primary btn--call" href={`tel:${facility.phone}`} onClick={onPhoneTap}>
          📞 予約電話：{facility.phone}
        </a>
      </div>

      <CallTemplate />

      <section className="detail-section">
        <h3 className="section-title">対応・設備</h3>
        <div className="attr-grid">
          {FILTER_DEFS.map((f) => {
            const v = facility[f.key]
            const tone = v === true ? 'on' : v === false ? 'off' : 'unknown'
            const mark = v === true ? '○' : v === false ? '×' : '—'
            return (
              <div className={`attr attr--${tone}`} key={f.key}>
                <span className="attr-mark">{mark}</span>
                <span className="attr-label">
                  {f.label}
                  {tone === 'unknown' && <span className="attr-unknown">（未確認）</span>}
                </span>
              </div>
            )
          })}
        </div>

        {facility.exam_types && facility.exam_types.length > 0 && (
          <div className="exam-types">
            <span className="filters-label">対応する精密検査</span>
            <div className="card-badges">
              {facility.exam_types.map((t) => (
                <span className="badge badge--info" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {facility.website && (
          <p className="detail-website">
            <a href={facility.website} target="_blank" rel="noreferrer">
              公式サイトを見る ›
            </a>
          </p>
        )}
      </section>

      {facility.form_note && (
        <section className="detail-section form-note">
          <h3 className="section-title">施設からの情報</h3>
          <p>{facility.form_note}</p>
        </section>
      )}

      <section className="detail-section">
        {aggregate ? <ReviewSummary aggregate={aggregate} /> : <p className="list-status">口コミを読み込み中…</p>}
      </section>

      <section className="detail-section">
        <ReviewForm facilityId={facility.id} />
      </section>

      <p className="detail-source">
        {facility.source_url && (
          <a href={facility.source_url} target="_blank" rel="noreferrer">
            出典：栃木県 大腸がん検診精密検査医療機関 登録名簿
          </a>
        )}
        {!facility.verified && <span className="detail-unverified">　※情報は確認中の項目を含みます</span>}
      </p>
    </div>
  )
}

function BackLink() {
  return (
    <Link to="/" className="back-link">
      ‹ 一覧に戻る
    </Link>
  )
}
