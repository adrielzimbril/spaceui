import { POLAR_PRODUCTS, PRO_YEARLY_PRICE } from '@/lib/pricing-config'
import { BuyButton } from './buy-button'

export function CtaSection() {
  return (
    <section data-page-section className="mx-auto max-w-3xl scroll-mt-16 px-5 sm:px-6 py-10">
      <div className="flex flex-col items-center gap-6 rounded-5xl bg-muted p-10 text-center sm:p-14">
        <h2 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-[36px]">
          Ready to ship faster?
        </h2>
        <p className="max-w-xl text-muted-foreground text-sm sm:text-base">
          Join Space UI Pro and get every component, block, and future drop — starting at ${PRO_YEARLY_PRICE}/year.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <BuyButton productId={POLAR_PRODUCTS.proYearly} label="Get Pro" variant="primary" size="lg" border />
        </div>
      </div>
    </section>
  )
}
