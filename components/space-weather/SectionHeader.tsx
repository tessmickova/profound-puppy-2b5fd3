'use client'
// components/space-weather/SectionHeader.tsx

interface Props {
  icon: string
  title: string
  subtitle?: string
  count?: number
}

export function SectionHeader({ icon, title, subtitle, count }: Props) {
  return (
    <div className="mb-4">
      <div className="text-[10px] font-mono tracking-[3px] text-aurora-teal/60 uppercase flex items-center gap-3">
        {icon} {title}
        <span className="flex-1 h-px bg-white/5" />
        {count != null && <span className="text-slate-600">{count} událostí</span>}
      </div>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      )}
    </div>
  )
}
