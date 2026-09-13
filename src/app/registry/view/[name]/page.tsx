import { RegistryViewClient } from './client'

export default async function RegistryViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>
  searchParams: Promise<{ props?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  return <RegistryViewClient name={resolvedParams?.name || ''} encodedProps={resolvedSearchParams?.props} />
}
