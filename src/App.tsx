import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import DisclaimerFooter from './components/DisclaimerFooter'
import { recordEvent } from './lib/events'
import { MUNI_SLUGS } from './types'

// ルートを遅延読み込みして初期バンドルを軽くする
const ListPage = lazy(() => import('./pages/ListPage'))
const FacilityDetailPage = lazy(() => import('./pages/FacilityDetailPage'))

export default function App() {
  // QR経由アクセスの計測：?src=qr を初回表示時に1回だけ記録
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('src') === 'qr' && !sessionStorage.getItem('qr_recorded')) {
      const muni = params.get('muni')
      recordEvent({
        event_type: 'qr_access',
        municipality: muni ? MUNI_SLUGS[muni] ?? muni : null,
      })
      sessionStorage.setItem('qr_recorded', '1')
    }
  }, [])

  return (
    <div className="app">
      <main className="app-main">
        <Suspense fallback={<p className="list-status">読み込み中…</p>}>
          <Routes>
            <Route path="/" element={<ListPage />} />
            <Route path="/facility/:id" element={<FacilityDetailPage />} />
          </Routes>
        </Suspense>
      </main>
      <DisclaimerFooter />
    </div>
  )
}
