export interface Coords {
  lat: number
  lng: number
}

/** 2点間の距離 (km) をhaversineで概算。 */
export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

/** 緯度経度があれば座標、なければ施設名＋住所でGoogleマップ検索URLを作る。 */
export function mapsUrl(f: {
  lat: number | null
  lng: number | null
  address: string
  name: string
}): string {
  const query =
    f.lat != null && f.lng != null ? `${f.lat},${f.lng}` : `${f.name} ${f.address}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** 現在地を取得（Promise化）。許可されなければreject。 */
export function getCurrentPosition(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('geolocation unavailable'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    )
  })
}
