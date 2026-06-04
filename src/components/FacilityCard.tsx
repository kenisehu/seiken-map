import { Link } from 'react-router-dom'
import Badge from './Badge'
import type { Facility } from '../types'
import { FILTER_DEFS } from '../lib/filters'
import { formatDistance } from '../lib/geo'

interface FacilityCardProps {
  facility: Facility
  distanceKm?: number | null
}

export default function FacilityCard({ facility, distanceKm }: FacilityCardProps) {
  // 「対応あり(true)」のバッジを上位4件だけ表示してカードを圧迫しない
  const onBadges = FILTER_DEFS.filter((f) => facility[f.key] === true).slice(0, 4)

  return (
    <Link to={`/facility/${facility.id}`} className="card">
      <div className="card-head">
        <h2 className="card-name">{facility.name}</h2>
        {distanceKm != null && (
          <span className="card-distance">{formatDistance(distanceKm)}</span>
        )}
      </div>

      <div className="card-meta">
        <span className="card-muni">{facility.municipality}</span>
        {facility.nearest_station && (
          <span>
            {facility.nearest_station}
            {facility.walk_minutes != null ? `・徒歩${facility.walk_minutes}分` : ''}
          </span>
        )}
      </div>

      <p className="card-address">{facility.address}</p>

      {onBadges.length > 0 && (
        <div className="card-badges">
          {onBadges.map((f) => (
            <Badge key={f.key} tone="on">
              {f.short}
            </Badge>
          ))}
        </div>
      )}

      <span className="card-cta">詳細・予約電話を見る ›</span>
    </Link>
  )
}
