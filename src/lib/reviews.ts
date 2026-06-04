import type { Review, ReviewAggregate } from '../types'
import { supabase } from './supabase'
import { DUMMY_REVIEWS } from '../data/dummyReviews'

type MetricKey = 'sedation_comfort' | 'staff_kindness' | 'wait_time'

function aggregate(reviews: Review[]): ReviewAggregate {
  const approved = reviews.filter((r) => r.approved)
  const avg = (key: MetricKey): number | null => {
    const vals = approved
      .map((r) => r[key])
      .filter((v): v is number => v != null)
    if (vals.length === 0) return null
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }
  return {
    count: approved.length,
    sedation_comfort: avg('sedation_comfort'),
    staff_kindness: avg('staff_kindness'),
    wait_time: avg('wait_time'),
  }
}

/** 承認済みレビューの集計値を取得。 */
export async function fetchReviewAggregate(facilityId: string): Promise<ReviewAggregate> {
  if (supabase) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('approved', true)
    if (!error && data) return aggregate(data as Review[])
    if (error) console.error('fetchReviewAggregate failed:', error)
  }
  return aggregate(DUMMY_REVIEWS.filter((r) => r.facility_id === facilityId))
}

export interface ReviewInput {
  facility_id: string
  sedation_comfort: number | null
  staff_kindness: number | null
  wait_time: number | null
}

export interface SubmitResult {
  ok: boolean
  message: string
}

/**
 * レビュー投稿。承認制なので approved=false で入る。
 * 連投対策として同一端末は施設ごとに1回まで（localStorage）。
 */
export async function submitReview(input: ReviewInput): Promise<SubmitResult> {
  const guardKey = `reviewed:${input.facility_id}`
  if (localStorage.getItem(guardKey)) {
    return { ok: false, message: 'この施設には既に投稿済みです。ご協力ありがとうございました。' }
  }

  try {
    if (supabase) {
      const { error } = await supabase
        .from('reviews')
        .insert({ ...input, approved: false })
      if (error) {
        console.error('submitReview failed:', error)
        return { ok: false, message: '送信に失敗しました。時間をおいて再度お試しください。' }
      }
    } else {
      console.info('[review submitted (dummy)]', input)
    }
    localStorage.setItem(guardKey, new Date().toISOString())
    return {
      ok: true,
      message: '投稿ありがとうございます。内容を確認のうえ掲載します（承認制）。',
    }
  } catch (err) {
    console.error('submitReview threw:', err)
    return { ok: false, message: '送信に失敗しました。時間をおいて再度お試しください。' }
  }
}

/** すでに投稿済みか（フォームの初期表示制御用）。 */
export function hasSubmitted(facilityId: string): boolean {
  return Boolean(localStorage.getItem(`reviewed:${facilityId}`))
}
