import Link from 'next/link'
import { polar } from '@/lib/polar'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'

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
    <main className="relative min-h-[80vh] flex items-center justify-center px-4 py-16">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-96 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg border border-border/70 bg-card/60 backdrop-blur-xl p-8 sm:p-10 squircle rounded-4xl shadow-2xl text-center space-y-6">
        {/* Animated Icon */}
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
          <CheckCircle2 className="size-10 stroke-[2.2]" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-xs px-2.5 py-0.5 border-emerald-500/30 text-emerald-500">
              <Sparkles className="size-3 mr-1" /> Paiement validé
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Merci pour votre confiance !
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Votre commande a été confirmée avec succès. Vous bénéficiez désormais de l'accès complet à vos composants
            Space UI.
          </p>
        </div>

        {/* Details Box */}
        {(customerEmail || checkout_id) && (
          <div className="rounded-2xl bg-muted/40 border border-border/50 p-4 text-left text-xs sm:text-sm space-y-2">
            {customerEmail && (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Compte associé :</span>
                <span className="font-medium text-foreground">{customerEmail}</span>
              </div>
            )}
            {checkout_id && (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Réf commande :</span>
                <span className="font-mono text-foreground">{checkout_id.slice(0, 16)}...</span>
              </div>
            )}
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Statut Polar :</span>
              <span className="font-medium capitalize text-emerald-500">{status}</span>
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="primary" size="lg" full asPointer asChild>
            <Link href="/primitives" className="flex items-center justify-center gap-2">
              <span>Explorer les composants</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button variant="base" size="lg" full asPointer asChild>
            <Link href="/">
              <span>Retour à l'accueil</span>
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>Paiement sécurisé opéré par Polar</span>
        </div>
      </div>
    </main>
  )
}
