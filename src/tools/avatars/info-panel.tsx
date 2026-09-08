'use client'

import type { ReactNode } from 'react'
import { DynamicCodeBlock } from '@/components/docs/code/dynamic-codeblock'
import { InstallCommandBlock } from '@/components/docs/installation/install-command-block'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { Badge } from '@/registry/primitives/badge'
import { DEFAULT_SEEDS } from '@/tools/shared/seeds'

const REACT_USAGE = `import { AvatarVariant, AvatarEffect } from '@usespaceui/avatars'
import { Avatar } from '@usespaceui/avatars/react';

export function UserProfile({ username }: { username: string }) {
  return (
    <Avatar
      name="${DEFAULT_SEEDS}"
      variant={AvatarVariant.pebble}
      size={64}
      circle={true}
      effect={AvatarEffect.none}
    />
  );
}`

const CREATE_AVATAR = `import { createAvatar, AvatarVariant, AvatarEffect, AvatarOutputFormat } from '@usespaceui/avatars';

const defaultSvg = createAvatar();

const svgMarkup = createAvatar({
  name: "alex",
  variant: AvatarVariant.triton,
  size: 256,
  effect: AvatarEffect.none,
});

const jsonPayload = createAvatar({
  name: "alex",
  variant: AvatarVariant.pebble,
  format: AvatarOutputFormat.json,
});`

const COLORS_USAGE = `// Your brand palette instead of the name-derived harmony.
<Avatar
  name="${DEFAULT_SEEDS}"
  colors={["#4f46e5", "#06b6d4", "#ec4899", "#8b5cf6", "#14b8a6"]}
/>`

function Section({ id, title, badge, children }: { id: string; title: string; badge?: string; children: ReactNode }) {
  return (
    <section id={id} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {badge ? (
          <Badge variant="secondary" className="rounded-full">
            {badge}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

export function AvatarInfoPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col md:py-5">
      <ScrollArea className="min-h-0 flex-1" data-lenis-prevent="true" scrollFade scrollbarGutter>
        <div className="flex flex-col gap-8 px-3.5 pb-8 pt-2">
          <Section id="what-is-it" title="What is it?" badge="@usespaceui/avatars">
            <p>
              Beautiful generative gradient avatars. A zero-dependency SVG avatar generator that dynamically generates
              beautiful, unique avatars from any seed string. Say goodbye to storing thousands of placeholder images.
            </p>
          </Section>

          <Section id="installation" title="Installation">
            <p>
              Install via your preferred package manager or use the REST API directly. See the{' '}
              <a
                href="https://avatars.spaceui.one/docs/api"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground"
              >
                API documentation
              </a>{' '}
              for more details.
            </p>
            <InstallCommandBlock packages="@usespaceui/avatars" className="my-0" />
          </Section>

          <Section id="how-to-use" title="How to use">
            <p>
              Use the React component for simple integration, or use the vanilla{' '}
              <Badge variant="secondary" className="rounded-full">
                createAvatar
              </Badge>{' '}
              function to generate SVG strings or JSON payloads without rendering the React component.
            </p>
            <p className="font-semibold text-foreground">React Component</p>
            <DynamicCodeBlock code={REACT_USAGE} lang="tsx" allowCopy className="my-0" />
            <p className="font-semibold text-foreground">Vanilla / JSON</p>
            <DynamicCodeBlock code={CREATE_AVATAR} lang="typescript" allowCopy className="my-0" />
          </Section>

          <Section id="customization" title="Families & Customization">
            <p>
              Choose from gradient, fluid, classic, and paletteless families. Every variant renders deterministically
              from its seed. You can fully customize the look and feel by tweaking the{' '}
              <Badge variant="secondary" className="rounded-full">
                colors
              </Badge>{' '}
              array or changing the{' '}
              <Badge variant="secondary" className="rounded-full">
                variant
              </Badge>
              .
            </p>
            <DynamicCodeBlock code={COLORS_USAGE} lang="tsx" allowCopy className="my-0" />
            <p>
              Check out the{' '}
              <a
                href="https://avatars.spaceui.one/docs#families"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground"
              >
                variants documentation
              </a>
              .
            </p>
          </Section>

          <Section id="keep-in-mind" title="Keep in mind">
            <ul className="list-disc space-y-2 pl-5">
              <li>Avatars are deterministic. The same seed + variant will always yield the same visual output.</li>
              <li>They render purely in SVG, meaning infinite scalability and crispness on Retina displays.</li>
              <li>No network requests are made. Everything generates locally.</li>
            </ul>
          </Section>

          <Section id="license" title="License & Usage">
            <p>
              Free and open source under the MIT license. Feel free to use it in your commercial or personal projects,
              with no attribution required.
            </p>
          </Section>
        </div>
      </ScrollArea>
    </div>
  )
}
