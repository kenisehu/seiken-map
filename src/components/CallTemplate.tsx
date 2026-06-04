import { useState } from 'react'

const TEMPLATE =
  '健診の便潜血検査で陽性だったので、大腸内視鏡の精密検査をお願いしたいです。'

export default function CallTemplate() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(TEMPLATE)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // クリップボード不可の環境では何もしない（本文は画面に出ている）
    }
  }

  return (
    <section className="call-template">
      <h3 className="call-template-title">📞 予約電話で言うとスムーズです</h3>
      <blockquote className="call-template-quote">「{TEMPLATE}」</blockquote>
      <button type="button" className="btn btn--ghost call-template-copy" onClick={copy}>
        {copied ? 'コピーしました ✓' : '文章をコピー'}
      </button>
    </section>
  )
}
