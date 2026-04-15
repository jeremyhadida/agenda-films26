import type { Film } from '@/lib/types'

interface TechInfoProps {
  film: Film
}

export function TechInfo({ film }: TechInfoProps) {
  const items = [
    { label: 'Format', value: film.projection_fmt },
    { label: 'Mix Audio', value: film.audio_mix },
    { label: 'Nationalité', value: film.nationality },
    { label: 'Studio', value: film.studio },
  ].filter(i => i.value)

  if (items.length === 0) return null

  return (
    <div className="bg-surface-low rounded-xl p-5">
      <h3 className="font-body text-xs uppercase tracking-widest text-muted mb-4">
        Infos Techniques
      </h3>
      <div className="space-y-3">
        {items.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-muted text-xs font-body">{label}</span>
            <span className="text-cyan text-sm font-body font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
