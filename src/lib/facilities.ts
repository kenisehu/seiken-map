import type { Facility } from '../types'
import { supabase } from './supabase'
import { TOCHIGI_FACILITIES } from '../data/tochigiFacilities'

/** 全施設を取得。Supabase未設定時はダミーデータを返す。 */
export async function fetchFacilities(): Promise<Facility[]> {
  if (supabase) {
    const { data, error } = await supabase.from('facilities').select('*').order('name')
    if (error) {
      console.error('fetchFacilities failed, falling back to dummy:', error)
      return TOCHIGI_FACILITIES
    }
    return (data as Facility[]) ?? []
  }
  return TOCHIGI_FACILITIES
}

/** 1施設を取得。 */
export async function fetchFacility(id: string): Promise<Facility | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) console.error('fetchFacility failed:', error)
    if (data) return data as Facility
  }
  return TOCHIGI_FACILITIES.find((f) => f.id === id) ?? null
}
