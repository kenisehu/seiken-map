import { useEffect, useMemo, useState } from 'react'
import SearchBox from '../components/SearchBox'
import Filters, { EMPTY_FILTERS, type FilterState } from '../components/Filters'
import FacilityCard from '../components/FacilityCard'
import { fetchFacilities } from '../lib/facilities'
import { isSupabaseConfigured } from '../lib/supabase'
import { haversineKm, getCurrentPosition, type Coords } from '../lib/geo'
import type { Facility } from '../types'

type GeoStatus = 'idle' | 'loading' | 'granted' | 'denied'

export default function ListPage() {
  const [facilities, setFacilities] = useState<Facility[] | null>(null)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [userCoords, setUserCoords] = useState<Coords | null>(null)
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle')

  useEffect(() => {
    let alive = true
    fetchFacilities().then((data) => {
      if (alive) setFacilities(data)
    })
    return () => {
      alive = false
    }
  }, [])

  const patch = (p: Partial<FilterState>) => setFilters((prev) => ({ ...prev, ...p }))

  const requestLocation = async () => {
    setGeoStatus('loading')
    try {
      const coords = await getCurrentPosition()
      setUserCoords(coords)
      setGeoStatus('granted')
    } catch {
      setGeoStatus('denied')
    }
  }

  const items = useMemo(() => {
    if (!facilities) return []
    const q = filters.search.trim()

    const filtered = facilities.filter((f) => {
      if (filters.municipality !== 'all' && f.municipality !== filters.municipality) return false
      if (q) {
        const hay = `${f.name} ${f.address} ${f.nearest_station ?? ''}`
        if (!hay.includes(q)) return false
      }
      for (const key of filters.bools) {
        if (f[key] !== true) return false
      }
      if (filters.walkMax != null) {
        if (f.walk_minutes == null || f.walk_minutes > filters.walkMax) return false
      }
      if (filters.examTypes.length > 0) {
        const ex = f.exam_types ?? []
        if (!filters.examTypes.some((t) => ex.includes(t))) return false
      }
      return true
    })

    const withDist = filtered.map((f) => ({
      facility: f,
      distanceKm:
        userCoords && f.lat != null && f.lng != null
          ? haversineKm(userCoords, { lat: f.lat, lng: f.lng })
          : null,
    }))

    withDist.sort((a, b) => {
      if (userCoords) {
        if (a.distanceKm == null && b.distanceKm == null) return cmpName(a, b)
        if (a.distanceKm == null) return 1
        if (b.distanceKm == null) return -1
        return a.distanceKm - b.distanceKm
      }
      return cmpName(a, b)
    })

    return withDist
  }, [facilities, filters, userCoords])

  // 自治体チップは実データから動的に生成（登録名簿の出現順を保つ）
  const municipalities = useMemo(() => {
    if (!facilities) return []
    const seen = new Set<string>()
    const list: string[] = []
    for (const f of facilities) {
      if (!seen.has(f.municipality)) {
        seen.add(f.municipality)
        list.push(f.municipality)
      }
    }
    return list
  }, [facilities])

  return (
    <div className="list-page">
      <header className="list-header">
        <h1 className="list-title">精検実施機関マップ</h1>
        <p className="list-lead">
          便潜血が陽性だった方へ。栃木県内で大腸内視鏡（精密検査）を受けられる登録医療機関です。
        </p>
      </header>

      {!isSupabaseConfigured && facilities && (
        <p className="data-note">
          出典：栃木県「大腸がん検診精密検査医療機関 登録名簿」（{facilities.length}施設・Supabase未接続）
        </p>
      )}

      <SearchBox value={filters.search} onChange={(v) => patch({ search: v })} />

      <div className="geo-row">
        <button
          type="button"
          className="btn btn--primary geo-btn"
          onClick={requestLocation}
          disabled={geoStatus === 'loading'}
        >
          📍 {geoStatus === 'loading' ? '現在地を取得中…' : '現在地から近い順'}
        </button>
        {geoStatus === 'granted' && <span className="geo-status">現在地から近い順に表示中</span>}
        {geoStatus === 'denied' && (
          <span className="geo-status geo-status--warn">
            位置情報を取得できませんでした。地域で絞り込んでください。
          </span>
        )}
      </div>

      <Filters state={filters} municipalities={municipalities} onChange={patch} />

      {facilities == null ? (
        <p className="list-status">読み込み中…</p>
      ) : (
        <>
          <p className="list-count">{items.length} 件</p>
          {items.length === 0 ? (
            <p className="list-status">
              条件に合う医療機関が見つかりませんでした。条件を減らしてお試しください。
            </p>
          ) : (
            <div className="card-list">
              {items.map(({ facility, distanceKm }) => (
                <FacilityCard key={facility.id} facility={facility} distanceKm={distanceKm} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function cmpName(
  a: { facility: Facility },
  b: { facility: Facility },
): number {
  return a.facility.name.localeCompare(b.facility.name, 'ja')
}
