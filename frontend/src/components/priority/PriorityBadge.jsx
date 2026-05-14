const CONFIG = {
  red:    { label: 'CRITICAL', cls: 'bg-red-900/50 text-red-300 border border-red-600' },
  orange: { label: 'URGENT',   cls: 'bg-orange-900/50 text-orange-300 border border-orange-500' },
  yellow: { label: 'STANDARD', cls: 'bg-yellow-900/50 text-yellow-300 border border-yellow-600' },
}

export default function PriorityBadge({ level, priority }) {
  const badgeLevel = priority || level;
  const c = CONFIG[badgeLevel] || CONFIG.yellow
  return (
    <span className={`text-xs font-mono font-bold px-2 py-1 rounded tracking-widest uppercase ${c.cls}`}>
      {c.label}
    </span>
  )
}