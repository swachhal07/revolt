import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import { formatNpr } from '@/utils/format'

export default function MotorcycleCard({ bike }) {
  return (
    <Card className="flex flex-col">
      <div className="mb-5 aspect-4/3 rounded-xl bg-ink-50" />
      <h3 className="font-display text-xl font-bold text-ink-900">{bike.name}</h3>
      {bike.tagline ? <p className="mt-2 text-sm text-ink-500">{bike.tagline}</p> : null}

      {/* Newly added models carry no figures yet, and a row of blank values
          reads as a broken card rather than an unfinished one — so the spec
          pair only appears once there is something to put in it. */}
      {bike.specs?.range || bike.specs?.topSpeed ? (
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-ink-500">Range</dt>
            <dd className="font-semibold text-ink-900">{bike.specs.range ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Top speed</dt>
            <dd className="font-semibold text-ink-900">{bike.specs.topSpeed ?? '—'}</dd>
          </div>
        </dl>
      ) : null}

      <div className="mt-6 flex items-center justify-between border-t border-ink-900/10 pt-5">
        <span className="font-display font-bold text-ink-900">
          {bike.priceNpr == null ? 'Price on request' : formatNpr(bike.priceNpr)}
        </span>
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
