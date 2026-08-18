import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import { formatNpr } from '@/utils/format'

export default function MotorcycleCard({ bike }) {
  return (
    <Card className="flex flex-col">
      <div className="mb-5 aspect-4/3 rounded-xl bg-ink-50" />
      <h3 className="font-display text-xl font-bold text-ink-900">{bike.name}</h3>
      <p className="mt-2 text-sm text-ink-500">{bike.tagline}</p>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-ink-500">Range</dt>
          <dd className="font-semibold text-ink-900">{bike.specs.range}</dd>
        </div>
        <div>
          <dt className="text-ink-500">Top speed</dt>
          <dd className="font-semibold text-ink-900">{bike.specs.topSpeed}</dd>
        </div>
      </dl>

      <div className="mt-6 flex items-center justify-between border-t border-ink-900/10 pt-5">
        <span className="font-display font-bold text-ink-900">{formatNpr(bike.priceNpr)}</span>
        <Link
          to={`/motorcycles/${bike.slug}`}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          View details →
        </Link>
      </div>
    </Card>
  )
}
