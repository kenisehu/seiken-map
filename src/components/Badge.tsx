import type { ReactNode } from 'react'

type Tone = 'on' | 'off' | 'unknown' | 'info'

interface BadgeProps {
  children: ReactNode
  tone?: Tone
}

export default function Badge({ children, tone = 'on' }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}
