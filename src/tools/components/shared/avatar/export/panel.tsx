'use client'

import { Button } from '@/registry/primitives/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/primitives/select'
import { Separator } from '@/registry/primitives/separator'
import { ToggleGroup, ToggleGroupItem } from '@/registry/primitives/toggle-group'
import type { VideoAspect, VideoExportSize } from './dims'
import type { MotionFormat } from './squish-video'

const BACKGROUNDS = [
  { id: 'transparent', label: 'Clear' },
  { id: '#FFFFFF', label: 'White' },
  { id: '#000000', label: 'Black' },
] as const

const ASPECTS: VideoAspect[] = ['1:1', '16:9', '9:16', '4:3']
const SIZES: VideoExportSize[] = [512, 720, 1080, 1440, 2160, 4092]
const STILL_FORMATS = ['png', 'svg'] as const
const MOTION_FORMATS: MotionFormat[] = ['webm', 'apng']

export function AvatarExportPanel({
  videoBg,
  setVideoBg,
  aspect,
  setAspect,
  exportSize,
  setExportSize,
  format,
  setFormat,
  motionFormat,
  setMotionFormat,
  onExport,
}: {
  videoBg: string
  setVideoBg: (value: string) => void
  aspect: VideoAspect
  setAspect: (value: VideoAspect) => void
  exportSize: VideoExportSize
  setExportSize: (value: VideoExportSize) => void
  format: 'png' | 'svg'
  setFormat: (value: 'png' | 'svg') => void
  motionFormat: MotionFormat
  setMotionFormat: (value: MotionFormat) => void
  onExport: () => void
}) {
  const current = BACKGROUNDS.find((item) => item.id === videoBg) ?? BACKGROUNDS[0]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <span className="text-[0.6875rem] font-semibold text-muted-foreground">Export</span>
        <div className="flex flex-col gap-2">
          <span className="text-[0.6875rem] font-semibold text-muted-foreground">Aspect</span>
          <ToggleGroup
            value={[aspect]}
            onValueChange={(value) => {
              const next = value[0]
              if (next) setAspect(next as VideoAspect)
            }}
            className="grid w-full grid-cols-4"
          >
            {ASPECTS.map((item) => (
              <ToggleGroupItem key={item} value={item} className="flex-1 px-1 text-[0.625rem]">
                {item}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <Select
          value={String(exportSize)}
          onValueChange={(value) => value && setExportSize(Number(value) as VideoExportSize)}
        >
          <SelectTrigger className="h-9 border-0 bg-muted px-3 text-xs">
            <SelectValue placeholder={`${exportSize}p`} />
          </SelectTrigger>
          <SelectContent>
            {SIZES.map((item) => (
              <SelectItem key={item} value={String(item)} label={`${item}p`}>
                {item}p
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-col gap-2">
          <span className="text-[0.6875rem] font-semibold text-muted-foreground">Export background</span>
          <Select value={videoBg} onValueChange={(value) => value && setVideoBg(value)}>
            <SelectTrigger className="h-10 border-0 bg-muted px-2.5 text-xs">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <span
                    className="size-6 rounded-full border border-border"
                    style={
                      current.id === 'transparent'
                        ? {
                            background: 'repeating-conic-gradient(#d4d4d8 0% 25%, white 0% 50%)',
                            backgroundSize: '8px 8px',
                          }
                        : { background: current.id }
                    }
                  />
                  {current.label}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {BACKGROUNDS.map((bg) => (
                <SelectItem key={bg.id} value={bg.id} label={bg.label}>
                  <span className="flex items-center gap-2">
                    <span
                      className="size-6 rounded-full border border-border"
                      style={
                        bg.id === 'transparent'
                          ? {
                              background: 'repeating-conic-gradient(#d4d4d8 0% 25%, white 0% 50%)',
                              backgroundSize: '8px 8px',
                            }
                          : { background: bg.id }
                      }
                    />
                    {bg.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[0.6875rem] font-semibold text-muted-foreground">Still</span>
          <ToggleGroup
            value={[format]}
            onValueChange={(value) => {
              const next = value[0]
              if (next === 'png' || next === 'svg') setFormat(next)
            }}
            className="grid w-full grid-cols-2"
          >
            {STILL_FORMATS.map((item) => (
              <ToggleGroupItem key={item} value={item} className="flex-1 uppercase">
                {item}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Button type="button" size="sm" onClick={onExport}>
            Download
          </Button>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-2">
        <span className="text-[0.6875rem] font-semibold text-muted-foreground">Motion</span>
        <ToggleGroup
          value={[motionFormat]}
          onValueChange={(value) => {
            const next = value[0]
            if (next === 'webm' || next === 'apng') setMotionFormat(next)
          }}
          className="grid w-full grid-cols-2"
        >
          {MOTION_FORMATS.map((item) => (
            <ToggleGroupItem key={item} value={item} className="flex-1 uppercase">
              {item}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  )
}
