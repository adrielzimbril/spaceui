import NextLink from 'next/link'
import { Link } from '@/registry/primitives/link'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center  gap-6 text-sm">
      <Link render={<NextLink href="/primitives/button" />}>Next.js Internal Link</Link>

      <Link asButton variant="underline" size="sm" render={<NextLink href="/primitives/button" />}>
        Go to Button Primitive
      </Link>
    </div>
  )
}
