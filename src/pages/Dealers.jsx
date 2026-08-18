import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import { DEALERS } from '@/data/dealers'

export default function Dealers() {
  return (
    <Section
      eyebrow="Dealers"
      title="Find a showroom near you"
      description="Sales, service and battery support at every location."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {DEALERS.map((dealer) => (
          <Card key={dealer.id}>
            <h3 className="font-display text-lg font-bold text-ink-900">{dealer.name}</h3>
            <p className="mt-1 text-sm text-brand-600">
              {dealer.city}, {dealer.province}
            </p>
            <p className="mt-4 text-sm text-ink-500">{dealer.address}</p>
            <a
              href={`tel:${dealer.phone}`}
              className="mt-2 inline-block text-sm font-semibold text-ink-900 hover:text-brand-600"
            >
              {dealer.phone}
            </a>
          </Card>
        ))}
      </div>
    </Section>
  )
}
