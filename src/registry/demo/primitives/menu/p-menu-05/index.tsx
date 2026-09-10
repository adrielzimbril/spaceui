import Link from 'next/link'
import { Button } from '@/registry/primitives/button'
import { Menu, MenuLinkItem, MenuPopup, MenuTrigger } from '@/registry/primitives/menu'

export default function Demo() {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>Open menu</MenuTrigger>
      <MenuPopup>
        <MenuLinkItem render={<Link href="/docs" />}>Docs</MenuLinkItem>
        <MenuLinkItem render={<Link href="/components" />}>Components</MenuLinkItem>
      </MenuPopup>
    </Menu>
  )
}
