import { IconHome, IconFolder, IconDots } from '@tabler/icons-react'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/registry/primitives/breadcrumb'
import { Button } from '@/registry/primitives/button'
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '@/registry/primitives/menu'

export default function Demo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <Menu>
            <MenuTrigger
              aria-label="More pages"
              render={<Button className="-m-1.5 text-muted-foreground" size="icon-sm" variant="ghost" />}
            >
              <IconDots aria-hidden="true" />
            </MenuTrigger>
            <MenuPopup align="start">
              <MenuItem render={<Link href="/docs" />}>Docs</MenuItem>
              <MenuItem render={<Link href="/components" />}>Components</MenuItem>
            </MenuPopup>
          </Menu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/components" />}>Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
