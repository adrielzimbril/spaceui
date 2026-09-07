'use client'
'use no memo'

import {
  IconArrowDown,
  IconArrowUp,
  IconSelector,
  IconCheck,
  IconArrowBarToLeft,
  IconArrowBarToRight,
  IconArrowLeft,
  IconArrowRight,
  IconAdjustmentsHorizontal,
  IconPinnedOff,
} from '@tabler/icons-react'

import { memo, useMemo } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { getColumnHeaderLabel, useDataGrid } from '@/registry/components/spaceui/data-grid/data-grid'
import type { Column } from '@tanstack/react-table'

import { cn } from '@/registry/lib/utils'
import { Button } from '@/registry/primitives/button'
import {
  Menu,
  MenuCheckboxItem,
  MenuPopup,
  MenuGroup,
  MenuItem,
  MenuGroupLabel,
  MenuSeparator,
  MenuSub,
  MenuSubPopup,
  MenuSubTrigger,
  MenuTrigger,
} from '@/registry/primitives/menu'
interface DataGridColumnHeaderProps<TData, TValue> extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  /** When omitted, uses `column.columnDef.meta.headerTitle`, then a string `columnDef.header`, then `column.id`. */
  title?: string
  icon?: ReactNode
  /** Reserved; pin controls are gated by tableLayout.columnsPinnable + column.getCanPin(). */
  pinnable?: boolean
  filter?: ReactNode
  visibility?: boolean
}

function DataGridColumnHeaderInner<TData, TValue>({
  column,
  title,
  icon,
  className,
  filter,
  visibility = false,
}: DataGridColumnHeaderProps<TData, TValue>) {
  const { isLoading, table, props } = useDataGrid()
  const resolvedTitle = title ?? getColumnHeaderLabel(column)

  // TanStack's columnOrder defaults to [] until a consumer seeds it; fall
  // back to the definition order so Move Left/Right work out of the box.
  const columnOrderState = table.getState().columnOrder
  const columnOrder =
    columnOrderState.length > 0 ? columnOrderState : table.getAllLeafColumns().map((leafColumn) => leafColumn.id)
  const columnVisibilityKey =
    props.tableLayout?.columnsVisibility && visibility ? JSON.stringify(table.getState().columnVisibility) : ''
  const isSorted = column.getIsSorted()
  const isPinned = column.getIsPinned()
  const canSort = column.getCanSort()
  const canPin = column.getCanPin()
  const canResize = column.getCanResize()

  const columnIndex = columnOrder.indexOf(column.id)
  const canMoveLeft = columnIndex > 0
  const canMoveRight = columnIndex < columnOrder.length - 1

  const handleSort = () => {
    if (isSorted === 'asc') {
      column.toggleSorting(true)
    } else if (isSorted === 'desc') {
      column.clearSorting()
    } else {
      column.toggleSorting(false)
    }
  }

  const headerLabelClassName = cn(
    'text-secondary-foreground/80 inline-flex h-full items-center gap-1.5 font-normal [&_svg]:opacity-60 text-[0.8125rem] leading-[calc(1.125/0.8125)] [&_svg]:size-3.5',
    className,
  )

  const headerButtonClassName = cn(
    'text-secondary-foreground/80 hover:bg-secondary data-[state=open]:bg-secondary hover:text-foreground data-[state=open]:text-foreground px-2 font-normal h-6 rounded-lg',
    className,
  )

  const sortIcon =
    canSort &&
    (isSorted === 'desc' ? (
      <IconArrowDown className="size-3.25" aria-hidden="true" />
    ) : isSorted === 'asc' ? (
      <IconArrowUp className="size-3.25" aria-hidden="true" />
    ) : (
      <IconSelector className="mt-px size-3.25" aria-hidden="true" />
    ))

  const hasControls =
    props.tableLayout?.columnsMovable ||
    (props.tableLayout?.columnsVisibility && visibility) ||
    (props.tableLayout?.columnsPinnable && canPin) ||
    filter

  const menuItems = useMemo(() => {
    const items: ReactNode[] = []
    let hasPreviousSection = false

    // Filter section
    if (filter) {
      items.push(
        <MenuGroup key="group-filter">
          <MenuGroupLabel key="filter">{filter}</MenuGroupLabel>
        </MenuGroup>,
      )
      hasPreviousSection = true
    }

    // Sort section
    if (canSort) {
      if (hasPreviousSection) {
        items.push(<MenuSeparator key="sep-sort" />)
      }
      items.push(
        <MenuItem
          key="sort-asc"
          onClick={() => {
            if (isSorted === 'asc') {
              column.clearSorting()
            } else {
              column.toggleSorting(false)
            }
          }}
          disabled={!canSort}
        >
          <IconArrowUp className="size-3.5!" />
          <span className="grow">Asc</span>
          {isSorted === 'asc' && <IconCheck className="text-primary size-4 opacity-100!" />}
        </MenuItem>,
        <MenuItem
          key="sort-desc"
          onClick={() => {
            if (isSorted === 'desc') {
              column.clearSorting()
            } else {
              column.toggleSorting(true)
            }
          }}
          disabled={!canSort}
        >
          <IconArrowDown className="size-3.5!" />
          <span className="grow">Desc</span>
          {isSorted === 'desc' && <IconCheck className="text-primary size-4 opacity-100!" />}
        </MenuItem>,
      )
      hasPreviousSection = true
    }

    // Pin section
    if (props.tableLayout?.columnsPinnable && canPin) {
      if (hasPreviousSection) {
        items.push(<MenuSeparator key="sep-pin" />)
      }
      items.push(
        <MenuItem key="pin-left" onClick={() => column.pin(isPinned === 'left' ? false : 'left')}>
          <IconArrowBarToLeft className="size-3.5!" aria-hidden="true" />
          <span className="grow">Pin to left</span>
          {isPinned === 'left' && <IconCheck className="text-primary size-4 opacity-100!" />}
        </MenuItem>,
        <MenuItem key="pin-right" onClick={() => column.pin(isPinned === 'right' ? false : 'right')}>
          <IconArrowBarToRight className="size-3.5!" aria-hidden="true" />
          <span className="grow">Pin to right</span>
          {isPinned === 'right' && <IconCheck className="text-primary size-4 opacity-100!" />}
        </MenuItem>,
      )
      hasPreviousSection = true
    }

    // Move section
    if (props.tableLayout?.columnsMovable) {
      if (hasPreviousSection) {
        items.push(<MenuSeparator key="sep-move" />)
      }
      items.push(
        <MenuItem
          key="move-left"
          onClick={() => {
            if (columnIndex > 0) {
              const newOrder = [...columnOrder]
              const [movedColumn] = newOrder.splice(columnIndex, 1)
              newOrder.splice(columnIndex - 1, 0, movedColumn)
              table.setColumnOrder(newOrder)
            }
          }}
          disabled={!canMoveLeft || isPinned !== false}
        >
          <IconArrowLeft className="size-3.5!" aria-hidden="true" />
          <span>Move to Left</span>
        </MenuItem>,
        <MenuItem
          key="move-right"
          onClick={() => {
            if (columnIndex < columnOrder.length - 1) {
              const newOrder = [...columnOrder]
              const [movedColumn] = newOrder.splice(columnIndex, 1)
              newOrder.splice(columnIndex + 1, 0, movedColumn)
              table.setColumnOrder(newOrder)
            }
          }}
          disabled={!canMoveRight || isPinned !== false}
        >
          <IconArrowRight className="size-3.5!" aria-hidden="true" />
          <span>Move to Right</span>
        </MenuItem>,
      )
      hasPreviousSection = true
    }

    // Visibility section
    if (props.tableLayout?.columnsVisibility && visibility) {
      if (hasPreviousSection) {
        items.push(<MenuSeparator key="sep-visibility" />)
      }
      items.push(
        <MenuSub key="visibility">
          <MenuSubTrigger>
            <IconAdjustmentsHorizontal className="size-3.5!" />
            <span>Columns</span>
          </MenuSubTrigger>
          <MenuSubPopup side="right">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <MenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  className="capitalize"
                >
                  {getColumnHeaderLabel(col)}
                </MenuCheckboxItem>
              ))}
          </MenuSubPopup>
        </MenuSub>,
      )
    }

    return items
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter,
    canSort,
    isSorted,
    column,
    props.tableLayout?.columnsPinnable,
    props.tableLayout?.columnsMovable,
    props.tableLayout?.columnsVisibility,
    canPin,
    isPinned,
    canMoveLeft,
    canMoveRight,
    visibility,
    table,
    columnIndex,
    columnOrder,
    columnVisibilityKey, // Needed to update checkbox states when visibility changes
  ])

  if (hasControls) {
    return (
      <div className="-ms-2 flex h-full items-center justify-between gap-1.5">
        <Menu>
          <MenuTrigger
            render={
              <Button variant="ghost" className={headerButtonClassName} disabled={isLoading}>
                {icon && icon}
                {resolvedTitle}
                {sortIcon}
              </Button>
            }
          />
          <MenuPopup className="w-40" align="start">
            {menuItems}
          </MenuPopup>
        </Menu>
        {props.tableLayout?.columnsPinnable && canPin && isPinned && (
          <Button
            size="icon-sm"
            variant="ghost"
            className="rounded-lg -me-1 size-7"
            onClick={() => column.pin(false)}
            aria-label={`Unpin ${resolvedTitle} column`}
            title={`Unpin ${resolvedTitle} column`}
          >
            <IconPinnedOff className="size-3.5! opacity-50!" aria-hidden="true" />
          </Button>
        )}
      </div>
    )
  }

  if (canSort || (props.tableLayout?.columnsResizable && canResize)) {
    return (
      <div className="-ms-2 flex h-full items-center">
        <Button variant="ghost" className={headerButtonClassName} disabled={isLoading} onClick={handleSort}>
          {icon && icon}
          {resolvedTitle}
          {sortIcon}
        </Button>
      </div>
    )
  }

  return (
    <div className={headerLabelClassName}>
      {icon && icon}
      {resolvedTitle}
    </div>
  )
}

const DataGridColumnHeader = memo(DataGridColumnHeaderInner) as typeof DataGridColumnHeaderInner

export { DataGridColumnHeader, type DataGridColumnHeaderProps }
