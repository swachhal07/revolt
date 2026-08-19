/**
 * Hairline line-icons. Stroke stays at 1.25 so they read as precise
 * drawn lines rather than heavy UI glyphs. Size via className.
 */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

export function ArrowUpRight({ className = 'size-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  )
}

export function ArrowRight({ className = 'size-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 12h15" />
      <path d="m12.5 5.5 6.5 6.5-6.5 6.5" />
    </svg>
  )
}

export function ArrowDown({ className = 'size-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 5v14" />
      <path d="m5.5 12.5 6.5 6.5 6.5-6.5" />
    </svg>
  )
}

export function ArrowUp({ className = 'size-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 19V5" />
      <path d="m5.5 11.5 6.5-6.5 6.5 6.5" />
    </svg>
  )
}

/** Slightly heavier than the arrows — at 16px a 1.25 stroke disappears. */
export function ChevronDown({ className = 'size-4' }) {
  return (
    <svg {...base} className={className} strokeWidth={2}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

/** Rotate 180° for the previous-slide direction. */
export function ChevronRight({ className = 'size-4' }) {
  return (
    <svg {...base} className={className} strokeWidth={2}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

export function Bolt({ className = 'size-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
    </svg>
  )
}

export function Phone({ className = 'size-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M8.4 3.5 10.5 8l-2 1.4a10.5 10.5 0 0 0 5.1 5.1L15 12.5l4.5 2.1v3.4a1.6 1.6 0 0 1-1.7 1.6C10.9 19.1 4.9 13.1 4.4 6.2A1.6 1.6 0 0 1 6 4.5h2.4Z" />
    </svg>
  )
}

export function Mail({ className = 'size-4' }) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4.2 7.2 7 5a1.4 1.4 0 0 0 1.6 0l7-5" />
    </svg>
  )
}

export function Pin({ className = 'size-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21s6.5-6.1 6.5-11a6.5 6.5 0 1 0-13 0C5.5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="10" r="2.25" />
    </svg>
  )
}

export function Clock({ className = 'size-4' }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.4V12l3.1 2" />
    </svg>
  )
}

/** Heavier than the arrows — it appears at 24px inside the sent-state disc. */
export function Check({ className = 'size-4' }) {
  return (
    <svg {...base} className={className} strokeWidth={1.75}>
      <path d="m5 12.6 4.4 4.4L19 7.4" />
    </svg>
  )
}
