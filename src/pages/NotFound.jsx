import Section from '@/components/ui/Section'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <Section>
      <div className="py-16 text-center">
        <p className="font-display text-6xl font-bold text-brand-600">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">Page not found</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-500">
          The page you are looking for does not exist, or has been moved.
        </p>
        <Button to="/" className="mt-8">
          Back to home
        </Button>
      </div>
    </Section>
  )
}
