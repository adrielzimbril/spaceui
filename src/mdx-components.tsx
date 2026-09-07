import * as React from 'react'
import { cn } from '@/registry/lib/utils'
import { Card } from 'fumadocs-ui/components/card'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { ComponentPreview } from '@/components/docs/preview/preview'
import { ShowcaseCard } from '@/components/docs/preview/showcase-card'
import { ShowcaseGrid } from '@/components/docs/preview/showcase-grid'
import { ComponentInstallation } from '@/components/docs/installation/installation'
import { InstallCommandBlock } from '@/components/docs/installation/install-command-block'
import { ComponentSource } from '@/components/docs/preview/source'
import { SpaceCodeTabs, TabsList, TabsPanel, TabsTab } from '@/components/docs/code/space-code-tabs'
import { ExternalLink } from '@/components/docs/mdx/external-link'
import { Steps, Step } from 'fumadocs-ui/components/steps'
import { TypeTable, Table } from '@/components/docs/mdx/type-table'
import { CodeBlock, Pre, type CodeBlockProps } from '@/components/docs/code/codeblock'
import { ShikiRenderer } from '@/components/docs/code/shiki-renderer'
import { Callout } from '@/components/docs/mdx/callout'
import { Code } from '@/registry/primitives/code'
import { Kbd, KbdGroup } from '@/registry/primitives/kbd'
import { Badge } from '@/registry/primitives/badge'
import { Link } from '@/registry/primitives/link'

import {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Paragraph,
  UnorderedList,
  OrderedList,
  ListItem,
  HorizontalRule,
  Blockquote,
  Strong,
} from '@/components/docs/mdx/typography'
import { HeadingSpecs, BodySpecs } from '@/components/docs/mdx/typography-interactive'
import { TypographyPlayground } from '@/components/docs/mdx/typography-playground'
import { ColorToken, ColorSwatch } from '@/components/docs/mdx/color-swatch'
import { IconPreview } from '@/components/docs/mdx/icon-preview'

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    TypographyPlayground,
    HeadingSpecs,
    BodySpecs,
    ColorToken,
    ColorSwatch,
    IconPreview,
    h1: H1,
    h2: H2,
    h3: H3,
    h4: H4,
    h5: H5,
    h6: H6,
    p: Paragraph,
    ul: UnorderedList,
    ol: OrderedList,
    li: ListItem,
    hr: HorizontalRule,
    blockquote: Blockquote,
    strong: Strong,
    ...components,
    Card: ({ children, className, accent, ...props }) => (
      <Card
        className={cn(
          'flex flex-col items-center justify-center py-7 bg-accent/50 border-none [&>h3]:text-base [&>h3]:text-current [&>div]:bg-transparent [&>div]:shadow-none [&>div]:border-none [&_svg]:size-10',
          accent && '[&>h3]:text-fd-muted-foreground',
          className,
        )}
        {...props}
      >
        {children}
      </Card>
    ),
    ComponentPreview,
    ShowcaseCard,
    ShowcaseGrid,
    ComponentGrid: ShowcaseGrid,
    ComponentInstallation,
    InstallCommandBlock,
    ComponentSource,
    SpaceCodeTabs,
    TabsList,
    TabsPanel,
    TabsTab,
    TypeTable,
    table: Table,
    Code,
    Kbd,
    kbd: Kbd,
    KbdGroup,
    Badge,
    Link,
    code: (props) => {
      // If code is inline, render as Code primitive
      if (typeof props.children === 'string' || React.isValidElement(props.children)) {
        return <Code {...(props as any)} />
      }
      return <code {...props} />
    },
    ExternalLink,
    Steps,
    Step,
    Callout,
    pre: (props: any) => {
      const codeBlockProps = props as unknown as CodeBlockProps

      return (
        <CodeBlock {...codeBlockProps}>
          <Pre>{props.children}</Pre>
        </CodeBlock>
      )
    },
  }
}
