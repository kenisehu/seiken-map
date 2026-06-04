import type { Review } from '../types'

// レビューは承認制。実データはまだ無いため空。
// （Supabase接続時は reviews テーブルの承認済みレビューを集計表示する）
export const DUMMY_REVIEWS: Review[] = []
