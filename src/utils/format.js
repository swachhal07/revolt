/** Format a number as Nepali Rupees, e.g. 549000 -> "Rs. 549,000" */
export function formatNpr(amount) {
  if (typeof amount !== 'number') return '—'
  return `Rs. ${new Intl.NumberFormat('en-IN').format(amount)}`
}
