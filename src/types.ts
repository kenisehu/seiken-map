// ドメイン型。Supabase の facilities / reviews / events に対応。

// 自治体名は栃木県内の市町。施設データから動的に集めるので型は文字列。
export type Municipality = string

// QRのURLパラメータ (?muni=...) → 自治体名 の対応（栃木県の市町）
export const MUNI_SLUGS: Record<string, string> = {
  utsunomiya: '宇都宮市',
  ashikaga: '足利市',
  tochigi: '栃木市',
  sano: '佐野市',
  kanuma: '鹿沼市',
  nikko: '日光市',
  oyama: '小山市',
  moka: '真岡市',
  otawara: '大田原市',
  yaita: '矢板市',
  nasushiobara: '那須塩原市',
  sakura: 'さくら市',
  nasukarasuyama: '那須烏山市',
  shimotsuke: '下野市',
  mibu: '壬生町',
  takanezawa: '高根沢町',
}

export type ExamType = '大腸内視鏡' | '便潜血再検' | '大腸CT検査'

export const EXAM_TYPES: ExamType[] = ['大腸内視鏡', '便潜血再検', '大腸CT検査']

// boolean 属性は true / false / null(=未確認) の3状態を取りうる
export interface Facility {
  id: string
  name: string
  municipality: Municipality
  address: string
  lat: number | null
  lng: number | null
  phone: string
  website: string | null
  nearest_station: string | null
  walk_minutes: number | null
  has_female_doctor: boolean | null
  has_sedation: boolean | null
  weekend: boolean | null
  quick_reservation: boolean | null
  parking: boolean | null
  online_reservation: boolean | null
  in_clinic_prep: boolean | null
  barrier_free: boolean | null
  credit_card: boolean | null
  ct_colonography: boolean | null
  exam_types: ExamType[] | null
  form_note: string | null
  source_url: string | null
  verified: boolean
  created_at?: string
  updated_at?: string
}

export interface Review {
  id: string
  facility_id: string
  sedation_comfort: number | null
  staff_kindness: number | null
  wait_time: number | null
  approved: boolean
  created_at?: string
}

export interface ReviewAggregate {
  count: number
  sedation_comfort: number | null
  staff_kindness: number | null
  wait_time: number | null
}

export type EventType = 'qr_access' | 'phone_tap' | 'detail_view'

export interface AppEvent {
  event_type: EventType
  facility_id?: string | null
  municipality?: string | null
}
