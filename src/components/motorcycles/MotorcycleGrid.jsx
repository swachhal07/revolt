import MotorcycleCard from './MotorcycleCard'

export default function MotorcycleGrid({ bikes }) {
  if (!bikes?.length) {
    return <p className="text-ink-500">No motorcycles to show yet.</p>
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {bikes.map((bike) => (
        <MotorcycleCard key={bike.slug} bike={bike} />
      ))}
    </div>
  )
}
