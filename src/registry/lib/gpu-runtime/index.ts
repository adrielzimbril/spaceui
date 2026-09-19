export function isLowPowerGpu() {
  if (typeof window === 'undefined') return true
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const narrow = window.innerWidth < 768
  const cores = navigator.hardwareConcurrency || 8
  return Boolean(connection?.saveData || coarse || reduced || narrow || cores <= 6)
}

export function deferUntilVisible(canvas: HTMLCanvasElement, start: () => void, rootMargin = '600px') {
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      start()
    },
    { threshold: 0, rootMargin },
  )
  io.observe(canvas)
  return () => io.disconnect()
}

export function attachGpuGate(canvas: HTMLCanvasElement, onPaused?: (paused: boolean) => void) {
  const state = { paused: true, lowPower: isLowPowerGpu() }

  const setPaused = (next: boolean) => {
    if (state.paused === next) return
    state.paused = next
    onPaused?.(next)
  }

  const sync = () => {
    const rect = canvas.getBoundingClientRect()
    const onScreen = rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0
    setPaused(document.hidden || !onScreen)
  }

  const io = new IntersectionObserver(([entry]) => setPaused(document.hidden || !entry.isIntersecting), {
    threshold: 0.12,
  })
  io.observe(canvas)

  const onVis = () => {
    if (document.hidden) setPaused(true)
    else sync()
  }
  document.addEventListener('visibilitychange', onVis)

  let scrollTimer: ReturnType<typeof setTimeout> | undefined
  const onScroll = () => {
    if (!state.paused) {
      setPaused(true)
    }
    if (scrollTimer) clearTimeout(scrollTimer)
    scrollTimer = setTimeout(() => {
      sync()
    }, 100)
  }
  window.addEventListener('scroll', onScroll, { passive: true })

  sync()

  return {
    state,
    frameMs: state.lowPower ? 70 : 0,
    dispose() {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('scroll', onScroll)
      if (scrollTimer) clearTimeout(scrollTimer)
    },
  }
}
