'use client'

export default function Demo() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full">
      <div className="flex w-full items-center justify-center gap-6 py-10">
        <div className="flex size-32 flex-col gap-2 items-center justify-center rounded-xl bg-muted">
          <span className="text-sm font-medium text-foreground">rounded-xl</span>
        </div>
        <div className="flex size-32 flex-col gap-2 items-center justify-center squircle rounded-xl bg-muted">
          <span className="text-sm font-medium text-foreground">squircle-xl</span>
        </div>
      </div>

      <div className="flex w-full items-center justify-center gap-6 py-10">
        <div className="flex size-32 flex-col gap-2 items-center justify-center rounded-2xl bg-muted text-center">
          <span className="text-sm font-medium text-foreground">rounded-2xl</span>
        </div>
        <div className="flex size-32 flex-col gap-2 items-center justify-center squircle rounded-2xl bg-muted text-center">
          <span className="text-sm font-medium text-foreground">squircle-2xl</span>
        </div>
        <div className="flex size-32 flex-col gap-2 items-center justify-center squircle/20 rounded-2xl bg-muted text-center">
          <span className="text-sm font-medium text-foreground">squircle-2xl/20</span>
        </div>
        <div className="flex size-32 flex-col gap-2 items-center justify-center squircle/100 rounded-2xl bg-muted text-center">
          <span className="text-sm font-medium text-foreground">squircle-2xl/100</span>
        </div>
      </div>

      <div className="flex w-full items-center justify-center gap-6 py-10">
        <div className="flex size-32 flex-col gap-2 items-center justify-center squircle rounded-lg border-4 border-blue-300 bg-muted text-center">
          <span className="text-sm font-medium text-foreground">squircle-lg</span>
        </div>
        <div className="flex size-32 flex-col gap-2 items-center justify-center squircle rounded-xl border-4 border-blue-300 bg-muted text-center">
          <span className="text-sm font-medium text-foreground">squircle-xl</span>
        </div>
        <div className="flex size-32 flex-col gap-2 items-center justify-center squircle rounded-2xl border-4 border-blue-300 bg-muted text-center">
          <span className="text-sm font-medium text-foreground">squircle-2xl</span>
        </div>
        <div className="flex size-32 flex-col gap-2 items-center justify-center squircle rounded-3xl border-4 border-blue-300 bg-muted text-center">
          <span className="text-sm font-medium text-foreground">squircle-3xl</span>
        </div>
      </div>

      <div className="flex w-full items-center justify-center gap-6 py-10">
        <div className="flex size-32 flex-col gap-2 items-center justify-center squircle/20 rounded-lg border-4 border-blue-300 bg-muted text-center">
          <span className="text-sm font-medium text-foreground">squircle-lg/20</span>
        </div>
        <div className="flex size-32 flex-col gap-2 items-center justify-center squircle/20 rounded-xl border-4 border-blue-300 bg-muted text-center">
          <span className="text-sm font-medium text-foreground">squircle-xl/20</span>
        </div>
        <div className="flex size-32 flex-col gap-2 items-center justify-center squircle/20 rounded-2xl border-4 border-blue-300 bg-muted text-center">
          <span className="text-sm font-medium text-foreground">squircle-2xl/20</span>
        </div>
        <div className="flex size-32 flex-col gap-2 items-center justify-center squircle/20 rounded-3xl border-4 border-blue-300 bg-muted text-center">
          <span className="text-sm font-medium text-foreground">squircle-3xl/20</span>
        </div>
      </div>

      <div className="flex w-full items-center justify-center gap-6 py-10">
        <div className="flex size-32 flex-col gap-2 items-center justify-center squircle/100 rounded-lg border-4 border-blue-300 bg-muted text-center">
          <span className="text-sm font-medium text-foreground">squircle-lg/100</span>
        </div>
        <div className="flex size-32 flex-col gap-2 items-center justify-center squircle/100 rounded-xl border-4 border-blue-300 bg-muted text-center">
          <span className="text-sm font-medium text-foreground">squircle-xl/100</span>
        </div>
        <div className="flex size-32 flex-col gap-2 items-center justify-center squircle/100 rounded-2xl border-4 border-blue-300 bg-muted text-center">
          <span className="text-sm font-medium text-foreground">squircle-2xl/100</span>
        </div>
        <div className="flex size-32 flex-col gap-2 items-center justify-center squircle/100 rounded-3xl border-4 border-blue-300 bg-muted text-center">
          <span className="text-sm font-medium text-foreground">squircle-3xl/100</span>
        </div>
      </div>
    </div>
  )
}
