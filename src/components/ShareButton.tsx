import { useState } from 'react'

interface ShareButtonProps {
  title: string
}

/** この施設ページを共有。Web Share API があればネイティブ共有、無ければURLコピー。 */
export default function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const onShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title}｜精検実施機関マップ`,
          text: `${title}（大腸内視鏡が受けられる医療機関）`,
          url,
        })
      } catch {
        // 共有キャンセル等は無視
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // クリップボード不可環境では何もしない
    }
  }

  return (
    <button type="button" className="btn btn--ghost" onClick={onShare}>
      {copied ? 'リンクをコピー ✓' : '🔗 共有'}
    </button>
  )
}
