// components/HuskyLogo.tsx — Stylized husky head SVG for AuroraDog branding
interface Props {
  size?: number
  className?: string
  glow?: boolean
}

export function HuskyLogo({ size = 32, className = '', glow = true }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={glow ? { filter: 'drop-shadow(0 0 8px rgba(0,255,170,0.5))' } : undefined}
      aria-label="AuroraDog logo"
    >
      {/* Left ear */}
      <path
        d="M10 28L6 6L22 20Z"
        fill="url(#earGrad)"
        stroke="#00d4ff"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Right ear */}
      <path
        d="M54 28L58 6L42 20Z"
        fill="url(#earGrad)"
        stroke="#00d4ff"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Inner left ear */}
      <path
        d="M12 24L10 12L20 20Z"
        fill="#1a1a2e"
        opacity="0.7"
      />
      {/* Inner right ear */}
      <path
        d="M52 24L54 12L44 20Z"
        fill="#1a1a2e"
        opacity="0.7"
      />
      {/* Head shape */}
      <path
        d="M12 28C12 20 18 14 32 14C46 14 52 20 52 28V38C52 50 44 58 32 58C20 58 12 50 12 38V28Z"
        fill="url(#headGrad)"
        stroke="#00d4ff"
        strokeWidth="1.2"
      />
      {/* Face mask (white area) */}
      <path
        d="M22 26C22 26 26 24 32 24C38 24 42 26 42 26V36L38 44H26L22 36V26Z"
        fill="#c8dce8"
        opacity="0.9"
      />
      {/* Forehead stripe */}
      <path
        d="M29 14V28L32 32L35 28V14"
        fill="url(#stripeGrad)"
        opacity="0.6"
      />
      {/* Left eye */}
      <ellipse cx="24" cy="32" rx="3.5" ry="4" fill="#0a0e1a" />
      <ellipse cx="24" cy="31" rx="2" ry="2.5" fill="url(#eyeGrad)" />
      <circle cx="23" cy="30" r="1" fill="#fff" opacity="0.9" />
      {/* Right eye */}
      <ellipse cx="40" cy="32" rx="3.5" ry="4" fill="#0a0e1a" />
      <ellipse cx="40" cy="31" rx="2" ry="2.5" fill="url(#eyeGrad)" />
      <circle cx="39" cy="30" r="1" fill="#fff" opacity="0.9" />
      {/* Nose */}
      <path
        d="M29 40L32 43L35 40Z"
        fill="#1a1a2e"
        stroke="#0a0e1a"
        strokeWidth="0.5"
      />
      {/* Mouth line */}
      <path
        d="M32 43V46M32 46C30 48 28 48 27 47M32 46C34 48 36 48 37 47"
        stroke="#1a1a2e"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      {/* Gradients */}
      <defs>
        <linearGradient id="headGrad" x1="32" y1="14" x2="32" y2="58">
          <stop offset="0%" stopColor="#2d3a5c" />
          <stop offset="60%" stopColor="#1a2640" />
          <stop offset="100%" stopColor="#0f1829" />
        </linearGradient>
        <linearGradient id="earGrad" x1="32" y1="6" x2="32" y2="28">
          <stop offset="0%" stopColor="#3d4f7c" />
          <stop offset="100%" stopColor="#1a2640" />
        </linearGradient>
        <linearGradient id="stripeGrad" x1="32" y1="14" x2="32" y2="32">
          <stop offset="0%" stopColor="#4a6080" />
          <stop offset="100%" stopColor="#2d3a5c" />
        </linearGradient>
        <radialGradient id="eyeGrad" cx="0.4" cy="0.35" r="0.6">
          <stop offset="0%" stopColor="#00ffaa" />
          <stop offset="70%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#0088aa" />
        </radialGradient>
      </defs>
    </svg>
  )
}
