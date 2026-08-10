'use client'
// components/space-weather/hero/HeroSkeleton.tsx

export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[50vh] min-h-[350px] max-h-[600px] bg-[#030810] rounded-none overflow-hidden animate-pulse">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-[-55%] w-[70vh] h-[70vh] rounded-full bg-orange-900/10" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[45%] w-[48vh] h-[48vh] rounded-full bg-blue-900/10" />
      <div className="absolute bottom-6 left-6 right-6">
        <div className="h-3 bg-white/5 rounded-sm w-1/3 mb-2" />
        <div className="h-2 bg-white/5 rounded-sm w-1/2 mb-4" />
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-16 bg-white/5 rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  )
}
