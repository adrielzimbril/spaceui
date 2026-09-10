'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconDownload,
  IconEdit,
  IconPlayerPause,
  IconPlayerPlay,
  IconRepeat,
} from '@tabler/icons-react'
import { Button } from '@/registry/primitives/button'
import { ToolbarButton } from '@/components/playground/playground-toolbar-button'
import { useFileUpload } from '@/registry/hooks/form/use-file-upload'
import { bloomSound, confirmSound, nudgeSound, openSound, pageSound, toggleSound } from '@/components/providers/sound-provider'
import { ResourceStudio } from '@/tools/components/shared/layout/studio'
import { ResourceNav } from '@/tools/components/shared/layout/nav'
import { ResourceToolbar, type ResourceToolbarConfig } from '@/tools/components/shared/layout/toolbar'
import { useResourceSidebars } from '@/tools/components/shared/layout/viewport'
import { cn } from '@/registry/lib/utils'
import type { Chip, ChipKey, OgState } from './types'
import { DEFAULT_OG_STATE, PRESETS, applySizeScale, cloneChips, presetState } from './presets'
import { OgCanvas } from './canvas'
import { OgLeftPanel } from './left-panel'
import { OgControlPanel } from './control-panel'
import { OgExportDrawer } from './export-drawer'

export function OgPlayground() {
  const [s, setS] = useState<OgState>(() => presetState(PRESETS[0], DEFAULT_OG_STATE))
  const [editing, setEditing] = useState(false)
  const [rev, setRev] = useState(0)
  const [activePreset, setActivePreset] = useState(PRESETS[0].id)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)

  // Playback & Animation Timeline state
  const [playing, setPlaying] = useState(false)
  const [loop, setLoop] = useState(true)
  const [clock, setClock] = useState<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const { isDesktop, showLeft, setShowLeft, showRight, setShowRight } = useResourceSidebars(true)
  const cardRef = useRef<HTMLDivElement | null>(null)

  // Registry useFileUpload hook for JSON configuration import
  const { openFileDialog: openJsonDialog, getInputProps: getJsonInputProps } = useFileUpload({
    accept: ['.json', 'application/json'],
    multiple: false,
    onFilesAdded: (added) => {
      const item = added[0]
      if (item && item.file instanceof File) {
        handleImportJsonFile(item.file)
      }
    },
  })

  const handleImportJsonFile = (file?: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        commit(
          () => ({
            ...DEFAULT_OG_STATE,
            ...parsed,
            chips: { ...DEFAULT_OG_STATE.chips, ...(parsed.chips ?? {}) },
          }),
          'import-json',
        )
        setRev((r) => r + 1)
        confirmSound()
      } catch (err) {
        console.error('Invalid JSON file:', err)
        nudgeSound()
      }
    }
    reader.readAsText(file)
  }

  // File Upload hook for drag & drop onto the canvas
  const { isDragging, getRootProps, getInputProps } = useFileUpload({
    accept: ['image/*', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.avif'],
    multiple: false,
    onFilesAdded: (added) => {
      const item = added[0]
      if (item && item.file instanceof File) {
        pageSound()
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            commit((p) => ({
              ...p,
              bgMode: 'image',
              bgImage: reader.result as string,
            }))
            bloomSound()
          }
        }
        reader.readAsDataURL(item.file)
      }
    },
  })

  // Undo / Redo History Stack
  const hist = useRef<{ past: OgState[]; future: OgState[]; key: string }>({
    past: [],
    future: [],
    key: '',
  })

  const commit = useCallback((fn: (prev: OgState) => OgState, key?: string) => {
    setS((prev) => {
      const next = fn(prev)
      if (next === prev) return prev
      const h = hist.current
      if (key && h.key === key && h.past.length) {
        return next
      }
      h.past = [...h.past.slice(-50), prev]
      h.future = []
      h.key = key || ''
      return next
    })
  }, [])

  const setField = useCallback(
    <K extends keyof OgState>(k: K, v: OgState[K]) => {
      commit((p) => (p[k] === v ? p : { ...p, [k]: v }), String(k))
    },
    [commit],
  )

  const setChip = useCallback(
    (key: ChipKey, patch: Partial<Chip>) => {
      commit(
        (p) => ({ ...p, chips: { ...p.chips, [key]: { ...p.chips[key], ...patch } } }),
        `chip:${key}:${Object.keys(patch).join()}`,
      )
    },
    [commit],
  )

  const undo = useCallback(() => {
    const h = hist.current
    if (!h.past.length) {
      nudgeSound()
      return
    }
    pageSound()
    setS((cur) => {
      const prev = h.past[h.past.length - 1]!
      h.past = h.past.slice(0, -1)
      h.future = [cur, ...h.future].slice(0, 50)
      h.key = ''
      return prev
    })
    setRev((r) => r + 1)
  }, [])

  const redo = useCallback(() => {
    const h = hist.current
    if (!h.future.length) {
      nudgeSound()
      return
    }
    pageSound()
    setS((cur) => {
      const next = h.future[0]!
      h.future = h.future.slice(1)
      h.past = [...h.past, cur]
      h.key = ''
      return next
    })
    setRev((r) => r + 1)
  }, [])

  // Keyboard Shortcuts (Cmd+Z / Cmd+Shift+Z / Cmd+Y)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      const k = e.key.toLowerCase()
      const isUndo = k === 'z' && !e.shiftKey
      const isRedo = (k === 'z' && e.shiftKey) || k === 'y'
      if (!isUndo && !isRedo) return
      const el = document.activeElement as HTMLElement | null
      if (el && (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
        return
      }
      e.preventDefault()
      if (isRedo) redo()
      else undo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  // Animation timeline loop
  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setClock(null)
      return
    }

    const totalDur = s.animDuration + s.animHold
    const t0 = performance.now()

    const loopTick = (now: number) => {
      const elapsed = (now - t0) / 1000
      if (loop) {
        setClock(elapsed % totalDur)
      } else {
        if (elapsed >= totalDur) {
          setClock(totalDur)
          setPlaying(false)
          return
        }
        setClock(elapsed)
      }
      rafRef.current = requestAnimationFrame(loopTick)
    }

    rafRef.current = requestAnimationFrame(loopTick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [playing, loop, s.animDuration, s.animHold])

  // Randomize Accent Colors
  const randomizeColors = useCallback(() => {
    const rand = () => {
      const h = Math.random() * 360
      const sat = (60 + Math.random() * 35) / 100
      const l = (45 + Math.random() * 20) / 100
      const c = (1 - Math.abs(2 * l - 1)) * sat
      const hp = h / 60
      const x = c * (1 - Math.abs((hp % 2) - 1))
      const [r1, g1, b1] =
        hp < 1
          ? [c, x, 0]
          : hp < 2
            ? [x, c, 0]
            : hp < 3
              ? [0, c, x]
              : hp < 4
                ? [0, x, c]
                : hp < 5
                  ? [x, 0, c]
                  : [c, 0, x]
      const m = l - c / 2
      const toRgb = (v: number) => Math.round(Math.min(255, Math.max(0, (v + m) * 255)))
      return `rgb(${toRgb(r1)}, ${toRgb(g1)}, ${toRgb(b1)})`
    }

    commit((p) => ({
      ...p,
      bgFrom: rand(),
      bgVia: rand(),
      bgTo: rand(),
      glow: rand(),
    }))
  }, [commit])

  // Preset switch
  const applyPreset = useCallback(
    (id: string) => {
      const p = PRESETS.find((x) => x.id === id)
      if (!p) return
      bloomSound()
      setActivePreset(id)
      commit((prev) => presetState(p, prev))
      setRev((r) => r + 1)
    },
    [commit],
  )

  // Reset to default
  const reset = useCallback(() => {
    bloomSound()
    commit(() => ({ ...DEFAULT_OG_STATE, chips: cloneChips(DEFAULT_OG_STATE.chips) }))
    setActivePreset('lapis-orbs')
    setRev((r) => r + 1)
  }, [commit])

  // Studio Toolbar Configuration with Left and Right Sidebar toggles
  const toolbarConfig: ResourceToolbarConfig = {
    theme: true,
    expand: true,
    info: true, // Left Sidebar (Presets & Layout)
    sidebar: true, // Right Sidebar (Inspector)
    reset: true,
    viewToggle: false,
    onReset: reset,
    onToggleExpand: setExpanded,
    onToggleInfo: () => {
      toggleSound(!showLeft ? 'on' : 'off')
      setShowLeft(!showLeft)
    },
    onToggleSidebar: () => {
      toggleSound(!showRight ? 'on' : 'off')
      setShowRight(!showRight)
    },
    infoVisible: showLeft,
    sidebarVisible: showRight,
    expanded,
  }

  return (
    <>
      <ResourceStudio
        showLeft={showLeft && !expanded}
        showRight={showRight && !expanded}
        leftWidth="19rem"
        rightWidth="22rem"
        onToggleLeft={setShowLeft}
        onToggleRight={setShowRight}
        className={expanded ? 'p-0' : undefined}
        left={
          <OgLeftPanel
            s={s}
            set={setField}
            onSelectPreset={applyPreset}
            activePresetId={activePreset}
            onSelectSize={(w, h) => {
              commit((prev) => applySizeScale(prev, w, h), 'size')
              setRev((r) => r + 1)
            }}
            onImportJson={openJsonDialog}
          />
        }
        canvas={
          <OgCanvas
            s={s}
            set={setField}
            cardRef={cardRef}
            editing={editing}
            rev={rev}
            clock={clock}
            expanded={expanded}
            isDragging={isDragging}
            rootProps={getRootProps()}
            inputProps={getInputProps()}
          />
        }
        float={
          <ResourceToolbar
            config={toolbarConfig}
            left={<ResourceNav />}
            right={
              <>
                {/* Undo / Redo */}
                <ToolbarButton
                  label="Undo (Ctrl+Z)"
                  onClick={undo}
                  className={!hist.current.past.length ? 'opacity-30 pointer-events-none' : undefined}
                >
                  <IconArrowBackUp className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  label="Redo (Ctrl+Y)"
                  onClick={redo}
                  className={!hist.current.future.length ? 'opacity-30 pointer-events-none' : undefined}
                >
                  <IconArrowForwardUp className="size-4" />
                </ToolbarButton>

                {/* Animation Play / Pause & Loop */}
                <ToolbarButton
                  label={playing ? 'Pause animation' : 'Play animation'}
                  pressed={playing}
                  onClick={() => {
                    toggleSound(playing ? 'off' : 'on')
                    setPlaying((p) => !p)
                  }}
                >
                  {playing ? (
                    <IconPlayerPause className="size-4 text-primary" />
                  ) : (
                    <IconPlayerPlay className="size-4" />
                  )}
                </ToolbarButton>

                <ToolbarButton
                  label={loop ? 'Loop enabled' : 'Single run'}
                  pressed={loop}
                  onClick={() => {
                    toggleSound(loop ? 'off' : 'on')
                    setLoop((l) => !l)
                  }}
                >
                  <IconRepeat className="size-4" />
                </ToolbarButton>

                {/* Inline Edit Toggle */}
                <ToolbarButton
                  label={editing ? 'Exit inline edit' : 'Inline edit mode'}
                  pressed={editing}
                  onClick={() => {
                    toggleSound(editing ? 'off' : 'on')
                    setEditing((e) => !e)
                  }}
                >
                  <IconEdit className="size-4" />
                </ToolbarButton>

                {/* Export Drawer Trigger */}
                <ToolbarButton
                  label="Export card"
                  onClick={() => {
                    openSound()
                    setIsExportOpen(true)
                  }}
                >
                  <IconDownload className="size-4" />
                </ToolbarButton>
              </>
            }
          />
        }
        right={
          <OgControlPanel
            s={s}
            set={setField}
            setChip={setChip}
            activePresetId={activePreset}
            onRandomizeColors={randomizeColors}
            onOpenExport={() => {
              openSound()
              setIsExportOpen(true)
            }}
          />
        }
      />

      {/* Slide-in Export Drawer */}
      <OgExportDrawer
        open={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        s={s}
        cardRef={cardRef}
        presetName={activePreset}
        onImportState={(newState) => {
          commit(() => newState)
          setRev((r) => r + 1)
        }}
      />

      {/* Registry useFileUpload hidden input for JSON configuration import */}
      <input {...getJsonInputProps()} className="sr-only hidden pointer-events-none" tabIndex={-1} />
    </>
  )
}
