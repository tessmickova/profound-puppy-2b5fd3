'use client'
// components/space-weather/EmptyState.tsx

interface Props {
  icon?: string
  message: string
}

export function EmptyState({ icon = '📭', message }: Props) {
  return (
    <div className="bg-[#04101e]/90 border border-white/[0.08] rounded-xl p-6 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm text-slate-500">{message}</div>
    </div>
  )
}
