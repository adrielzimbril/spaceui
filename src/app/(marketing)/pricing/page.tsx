'use client'

import * as React from 'react'
import Link from 'next/link'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { BuyButton } from '@/components/pricing/buy-button'
import {
  Check,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Crown,
  Laptop,
} from 'lucide-react'

// You can customize the Polar Product IDs here or via environment variables
const POLAR_PRODUCTS = {
  proMonthly: process.env.NEXT_PUBLIC_POLAR_PRO_MONTHLY_ID || '',
  proYearly: process.env.NEXT_PUBLIC_POLAR_PRO_YEARLY_ID || '',
  allAccessLifetime: process.env.NEXT_PUBLIC_POLAR_LIFETIME_ID || '',
  // Exemplary Fixed Price Templates
  templateImmersiveLens: process.env.NEXT_PUBLIC_POLAR_TEMPLATE_IMMERSIVE_ID || '',
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('yearly')

  const proProductId = billingCycle === 'yearly' ? POLAR_PRODUCTS.proYearly : POLAR_PRODUCTS.proMonthly
  const proPrice = billingCycle === 'yearly' ? '19' : '29'
  const proBilledNote = billingCycle === 'yearly' ? 'Facturé 228$ par an' : 'Facturé mensuellement'

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/15 blur-[120px] rounded-full"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30 text-primary">
          <Sparkles className="size-3.5 mr-1.5" />
          Tarifs clairs & flexibles
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
          Concevez des interfaces d'exception à vitesse grand V.
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Choisissez un abonnement pour un accès illimité à toute la bibliothèque, ou achetez vos templates individuellement à prix fixe.
        </p>

        {/* Billing toggle */}
        <div className="pt-4 flex items-center justify-center">
          <div className="relative flex items-center bg-muted/60 p-1 rounded-full border border-border/70 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Annuel</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded-full">
                -35%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Plans Grid */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {/* FREE PLAN */}
        <div className="relative flex flex-col justify-between border border-border/60 bg-card/40 backdrop-blur-sm p-6 sm:p-8 squircle rounded-4xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Community</h3>
              <Badge variant="outline" className="text-xs">Gratuit</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Idéal pour découvrir Space UI et intégrer les composants open-source.
            </p>
            <div className="flex items-baseline gap-1 pt-2">
              <span className="text-4xl font-bold tracking-tight text-foreground">0$</span>
              <span className="text-xs text-muted-foreground">/ pour toujours</span>
            </div>

            <ul className="pt-4 space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>Tous les composants de base & primitives</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>CLI d'installation standard</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>Support de Tailwind CSS & Motion</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>Accès au Community Wall</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <Button variant="base" full asPointer asChild>
              <Link href="/primitives">
                <span>Commencer gratuitement</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* PRO PLAN (RECOMMENDED) */}
        <div className="relative flex flex-col justify-between border-2 border-primary bg-card/80 backdrop-blur-md p-6 sm:p-8 squircle rounded-4xl shadow-xl shadow-primary/5">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge variant="primary" className="text-xs font-semibold px-3 py-1 flex items-center gap-1">
              <Crown className="size-3" />
              Recommandé
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Space UI Pro</h3>
              <Badge variant="primary" className="text-xs">Accès Total</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Pour les développeurs et studios exigeants qui veulent expédier des projets spectaculaires.
            </p>
            <div className="flex items-baseline gap-1 pt-2">
              <span className="text-4xl font-bold tracking-tight text-foreground">{proPrice}$</span>
              <span className="text-xs text-muted-foreground">/ mois</span>
            </div>
            <p className="text-[11px] text-muted-foreground">{proBilledNote}</p>

            <ul className="pt-4 space-y-2.5 text-xs sm:text-sm text-foreground/90">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span className="font-medium">Tous les composants Pro & Shaders</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span className="font-medium">Tous les Blocks & micro-interactions</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>Nouveaux composants ajoutés chaque semaine</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>Projets personnels et commerciaux illimités</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>Support prioritaire Discord & email</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            {proProductId ? (
              <BuyButton
                productId={proProductId}
                label="S'abonner à Pro"
                variant="primary"
                full
                size="lg"
              />
            ) : (
              <Button variant="primary" full size="lg" asPointer asChild>
                <Link href={`/checkout?products=pro_${billingCycle}`}>
                  <Zap className="size-4 mr-1.5" />
                  <span>S'abonner à Pro</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* ALL ACCESS LIFETIME */}
        <div className="relative flex flex-col justify-between border border-border/60 bg-card/40 backdrop-blur-sm p-6 sm:p-8 squircle rounded-4xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Lifetime Access</h3>
              <Badge variant="outline" className="text-xs">À vie</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Payez une seule fois, profitez de Space UI pour toujours. Aucun abonnement récurrent.
            </p>
            <div className="flex items-baseline gap-1 pt-2">
              <span className="text-4xl font-bold tracking-tight text-foreground">249$</span>
              <span className="text-xs text-muted-foreground">/ paiement unique</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Licence perpétuelle garantie</p>

            <ul className="pt-4 space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>Accès à vie à la totalité des composants & blocks</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>Toutes les futures mises à jour incluses</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>Tous les templates premium inclus</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>Licence d'équipe jusqu'à 3 développeurs</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            {POLAR_PRODUCTS.allAccessLifetime ? (
              <BuyButton
                productId={POLAR_PRODUCTS.allAccessLifetime}
                label="Obtenir l'accès à vie"
                variant="secondary"
                full
                size="lg"
              />
            ) : (
              <Button variant="secondary" full size="lg" asPointer asChild>
                <Link href="/checkout?products=lifetime">
                  <span>Obtenir l'accès à vie</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION PRIX FIXE : TEMPLATES & KITS INDIVIDUELS */}
      <div className="mt-24 pt-16 border-t border-border/50">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            <Layers className="size-3.5 mr-1.5" />
            Achats uniques à prix fixe
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Templates & Kits prêts à déployer
          </h2>
          <p className="text-sm text-muted-foreground">
            Vous n'avez besoin que d'un produit en particulier sans abonnement ? Achetez vos templates séparément au prix fixe de votre choix.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Template Card 1 */}
          <div className="group border border-border/60 bg-card/30 rounded-3xl p-5 squircle hover:border-border transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 border border-border/40 flex items-center justify-center text-muted-foreground group-hover:scale-[1.01] transition-transform">
                <Laptop className="size-10 opacity-70 text-foreground" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Immersive Lens Template</h3>
                <span className="font-bold text-foreground">49$</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Template portfolio & showcase 3D interactif avec shaders WebGL, galeries fluides et typographie premium.
              </p>
            </div>

            <div className="pt-5">
              <BuyButton
                productId={POLAR_PRODUCTS.templateImmersiveLens || 'template_immersive_lens'}
                price="49$"
                label="Acheter le template"
                variant="base"
                full
                size="sm"
              />
            </div>
          </div>

          {/* Example Template Card 2 */}
          <div className="group border border-border/60 bg-card/30 rounded-3xl p-5 squircle hover:border-border transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20 border border-border/40 flex items-center justify-center text-muted-foreground group-hover:scale-[1.01] transition-transform">
                <Terminal className="size-10 opacity-70 text-foreground" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">SaaS Dashboard & Analytics</h3>
                <span className="font-bold text-foreground">69$</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Application dashboard complète avec métriques, charts Recharts stylés, tables virtuelles et gestion de rôles.
              </p>
            </div>

            <div className="pt-5">
              <BuyButton
                productId="template_saas_dashboard"
                price="69$"
                label="Acheter le template"
                variant="base"
                full
                size="sm"
              />
            </div>
          </div>

          {/* Example Pack Card 3 */}
          <div className="group border border-border/60 bg-card/30 rounded-3xl p-5 squircle hover:border-border transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-red-500/20 border border-border/40 flex items-center justify-center text-muted-foreground group-hover:scale-[1.01] transition-transform">
                <Sparkles className="size-10 opacity-70 text-foreground" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Space Motion UI Pack</h3>
                <span className="font-bold text-foreground">39$</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Collection complète de 30+ animations, accordéons élastiques, morph-icons et effets squircle interactifs.
              </p>
            </div>

            <div className="pt-5">
              <BuyButton
                productId="pack_motion_ui"
                price="39$"
                label="Acheter le pack"
                variant="base"
                full
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Portal Banner */}
      <div className="mt-16 rounded-3xl border border-border/60 bg-muted/20 p-6 sm:p-8 squircle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-semibold text-foreground">Déjà abonné ?</h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gérez votre abonnement, vos factures et votre moyen de paiement via le portail client sécurisé.
          </p>
        </div>
        <Button variant="outline" size="sm" asPointer asChild>
          <a href="/api/customer-portal" className="flex items-center gap-1.5">
            <span>Portail client Polar</span>
            <ArrowRight className="size-3.5" />
          </a>
        </Button>
      </div>

      {/* Trust & Guarantee */}
      <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>Paiement sécurisé via Polar</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-primary" />
          <span>Accès instantané après validation</span>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-amber-500" />
          <span>Mises à jour incluses</span>
        </div>
      </div>
    </div>
  )
}
