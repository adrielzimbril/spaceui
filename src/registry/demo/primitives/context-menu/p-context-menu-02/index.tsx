import Link from 'next/link'
import {
  ContextMenu,
  ContextMenuLinkItem,
  ContextMenuPopup,
  ContextMenuTrigger,
} from '@/registry/primitives/context-menu'

export default function Demo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-full max-w-sm items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuPopup>
        <ContextMenuLinkItem render={<Link href="/docs" />}>Docs</ContextMenuLinkItem>
        <ContextMenuLinkItem render={<Link href="/components" />}>Components</ContextMenuLinkItem>
      </ContextMenuPopup>
    </ContextMenu>
  )
}
