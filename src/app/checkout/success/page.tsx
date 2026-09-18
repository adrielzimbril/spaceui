import Link from 'next/link'
import { polar } from '@/lib/polar'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { StatusBadge } from '@/registry/components/spaceui/status-badge'
import { LiquidBorder } from '@/registry/components/spaceui/liquid-metal-border'
import { SuccessConfetti } from '@/components/checkout/success-confetti'
import { AssetEmoji } from '@/tools/emoji/asset-emoji'
import { EmojiSource, EmojiType } from '@usespaceui/emoji'
import { CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react'

interface SuccessPageProps {
  searchParams: Promise<{ checkout_id?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { checkout_id } = await searchParams

  let checkoutData: any = null
  if (checkout_id) {
    try {
      checkoutData = await polar.checkouts.get({ id: checkout_id })
    } catch (err) {
      console.error('Failed to load Polar checkout:', err)
    }
  }

  const customerEmail = checkoutData?.customerEmail
  const status = checkoutData?.status ?? 'confirmed'

  return (
    <main className="relative flex min-h-[80vh] items-center justify-center px-5 py-16">
      <SuccessConfetti />

      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 squircle rounded-5xl bg-muted p-10 text-center sm:p-14">
        <StatusBadge
          variant="outline"
          status="online"
          size="lg"
          primaryText="Payment confirmed"
          className="select-none bg-background border-none"
        >
          <AssetEmoji codepoint="🎉" source={EmojiSource.Fluent} type={EmojiType.Anim} size={20} lazy={false} />
        </StatusBadge>

        <div className="flex size-16 items-center justify-center rounded-full bg-background text-emerald-500">
          <CheckCircle2 className="size-9" strokeWidth={2} />
        </div>

        <div className="space-y-2">
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-[36px]">You're all set</h1>
          <p className="max-w-sm text-muted-foreground text-sm sm:text-base">
            Your order is confirmed. You now have full access to your Space UI components.
          </p>
        </div>

        {(customerEmail || checkout_id) && (
          <div className="w-full space-y-2 squircle rounded-3xl bg-background p-4 text-left text-xs sm:text-sm">
            {customerEmail && (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Account</span>
                <span className="font-medium text-foreground">{customerEmail}</span>
              </div>
            )}
            {checkout_id && (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Order ref</span>
                <span className="font-mono text-foreground">{checkout_id.slice(0, 16)}...</span>
              </div>
            )}
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Status</span>
              <span className="font-medium capitalize text-emerald-500">{status}</span>
            </div>
          </div>
        )}

        <LiquidBorder className="flex squircle rounded-full p-0.75 hover:scale-105 transition-all duration-300">
          <Button
            variant="primary"
            size="lg"
            full
            asPointer
            className="bg-primary!"
            render={<Link href="/primitives" className="flex items-center justify-center gap-2" />}
          >
            <span>Explore components</span>
            <ArrowRight className="size-4" />
          </Button>
        </LiquidBorder>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>Payment securely processed by Polar</span>
        </div>
      </div>
    </main>
  )
}
