interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <div className="searchbox">
      <span className="searchbox-icon" aria-hidden="true">🔍</span>
      <input
        type="search"
        inputMode="search"
        className="searchbox-input"
        placeholder="住所・駅名で検索（例：宇都宮、那須塩原）"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="住所・駅名で検索"
      />
      {value && (
        <button
          type="button"
          className="searchbox-clear"
          aria-label="検索をクリア"
          onClick={() => onChange('')}
        >
          ×
        </button>
      )}
    </div>
  )
}
