import { useParams } from 'react-router-dom'
import Section from '@/components/ui/Section'
import Button from '@/components/ui/Button'
import NotFound from './NotFound'
import { getMotorcycleBySlug } from '@/data/motorcycles'
import { formatNpr } from '@/utils/format'

const SPEC_LABELS = {
  range: 'Range',
  topSpeed: 'Top speed',
  battery: 'Battery',
  chargeTime: 'Charge time',
  motor: 'Motor',
}

export default function MotorcycleDetail() {
  const { slug } = useParams()
  const bike = getMotorcycleBySlug(slug)

  if (!bike) return <NotFound />

  return (
    <Section eyebrow="Motorcycle" title={bike.name} description={bike.tagline}>
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="aspect-4/3 rounded-3xl bg-ink-50" />

        <div>
          <p className="font-display text-3xl font-bold text-ink-900">
            {formatNpr(bike.priceNpr)}
          </p>
          <p className="mt-1 text-sm text-ink-500">Ex-showroom, Kathmandu</p>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-ink-900/10 pt-8">
            {Object.entries(bike.specs).map(([key, value]) => (
              <div key={key}>
                <dt className="text-sm text-ink-500">{SPEC_LABELS[key] ?? key}</dt>
                <dd className="mt-1 font-semibold text-ink-900">{value}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-8 space-y-2 border-t border-ink-900/10 pt-8 text-sm text-ink-500">
            {bike.highlights.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-brand-600" aria-hidden="true">
                  ●
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button to="/contact" size="lg">
              Book a test ride
            </Button>
            <Button to="/dealers" size="lg" variant="outline">
              Find a dealer
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}
