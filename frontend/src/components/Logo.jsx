function Logo({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none">
      {/* Briefcase body */}
      <rect x="6" y="16" width="28" height="18" rx="4" fill="currentColor" />
      {/* Briefcase handle */}
      <path
        d="M15 16V12C15 10.3431 16.3431 9 18 9H22C23.6569 9 25 10.3431 25 12V16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Center clasp */}
      <rect x="17" y="22" width="6" height="4" rx="1" fill="black" fillOpacity="0.3" />
      {/* Upward growth spark */}
      <path
        d="M20 2L23 8L27 5L24 12L30 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  )
}

export default Logo