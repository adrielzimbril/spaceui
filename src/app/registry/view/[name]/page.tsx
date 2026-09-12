'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { index } from '@/__registry__/index';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

function unwrapValues(value: any): any {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  if ('value' in value) return value.value;
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, unwrapValues(nested)]),
  );
}

export default async function RegistryViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ props?: string }>;
}) {
  const { name } = await params;
  const item = index[name];
  if (!item || !item.component) notFound();

  const Component = item.component;
  const defaults = unwrapValues(Component.demoProps ?? item.meta?.demoProps ?? {});
  let sharedProps = {};
  try {
    const encodedProps = (await searchParams).props;
    if (encodedProps) sharedProps = JSON.parse(encodedProps);
  } catch {
    // Invalid shared props fall back to the original demo defaults.
  }
  const props = { ...defaults, ...sharedProps };

  const isUncontained =
    item.type === 'registry:block' ||
    item.type === 'registry:template' ||
    name.startsWith('block-') ||
    name.startsWith('template-') ||
    name.includes('shader') ||
    name.includes('gradient');

  return (
    <main
      className={`flex min-h-screen items-center justify-center ${
        isUncontained ? 'w-full p-0 overflow-x-hidden' : 'p-8'
      }`}
    >
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading preview...</div>}>
        <Component {...props} />
      </Suspense>
    </main>
  );
}
