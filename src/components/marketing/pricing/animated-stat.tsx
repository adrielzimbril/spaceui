export function AnimatedStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-muted p-6 sm:p-8">
      <p className="flex items-baseline gap-0.5 font-semibold text-4xl text-foreground tracking-tight">
        <span>{value}</span>
        <span>+</span>
      </p>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  )
}
