import type { FC } from 'react'

export const RoundCorner: FC = () => {
  return (
    <svg width={13} height={13} fill="none">
      <path
        d="M7.07 6.837C6.242 7.603 5.5 9.187 5.5 13h-5c0-4.187.759-7.603 3.18-9.837C6.05.973 9.415.5 13 .5v5c-3.416 0-5.051.527-5.93 1.337z"
        fill="currentColor"
      />
    </svg>
  )
}

export const SquareCorner: FC = () => {
  return (
    <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
      <path d="M0.5 0.5H13V5.5H5.5V13H0.5V0.5Z" fill="currentColor" />
    </svg>
  )
}

export const RandomColors: FC = () => {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <circle cx={8} cy={2.5} r={1.6} fill="currentColor" />
      <circle cx={13.2} cy={6.3} r={1.6} fill="currentColor" opacity={0.85} />
      <circle cx={11.2} cy={12.5} r={1.6} fill="currentColor" opacity={0.7} />
      <circle cx={4.8} cy={12.5} r={1.6} fill="currentColor" opacity={0.55} />
      <circle cx={2.8} cy={6.3} r={1.6} fill="currentColor" opacity={0.4} />
    </svg>
  )
}

export const Github: FC = () => {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
        fill="currentColor"
      />
    </svg>
  )
}

export const Star: FC = () => {
  return (
    <svg width={14} height={14} viewBox="0 0 12 12" fill="none">
      <path
        d="M6 1.2l1.12 2.27 2.5.36-1.81 1.77.43 2.49L6 6.98 3.76 8.09l.43-2.49L2.38 3.83l2.5-.36L6 1.2z"
        fill="currentColor"
      />
    </svg>
  )
}

export const ArrowRight: FC = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path
        d="M3.33337 8.00001H12.6667M12.6667 8.00001L8.00004 3.33334M12.6667 8.00001L8.00004 12.6667"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    </svg>
  )
}
