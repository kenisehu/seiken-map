import type { AppEvent } from '../types'
import { supabase } from './supabase'

/**
 * 計測イベントを記録。失敗してもUIは止めない（ベストエフォート）。
 * Supabase未設定時はコンソール出力のみ。
 */
export async function recordEvent(e: AppEvent): Promise<void> {
  try {
    if (supabase) {
      const { error } = await supabase.from('events').insert({
        event_type: e.event_type,
        facility_id: e.facility_id ?? null,
        municipality: e.municipality ?? null,
      })
      if (error) console.error('recordEvent failed:', error)
    } else {
      console.info('[event]', e)
    }
  } catch (err) {
    console.error('recordEvent threw:', err)
  }
}
