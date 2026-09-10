import { cn } from '@/registry/lib/utils'

interface SpaceLogoProps {
  size?: number
  className?: string
}

/** Space UI brand mark: gooey blue orb. */
export function SpaceLogo({ size = 28, className }: SpaceLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn('shrink-0 rounded-full', className)}
    >
      <g clipPath="url(#circle-clip-spaceui)">
        <defs>
          <clipPath id="circle-clip-spaceui">
            <circle cx="32" cy="32" r="32" />
          </clipPath>
          <clipPath id="av-spaceui-clip">
            <circle cx="32" cy="32" r="32" fill="white" />
          </clipPath>
          <filter id="av-spaceui-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.40" result="b" />
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
          </filter>
          <radialGradient id="av-spaceui-sheen" cx="0.32" cy="0.24" r="0.9">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="0.35" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="0.7" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g clipPath="url(#av-spaceui-clip)">
          <rect x="0" y="0" width="64" height="64" fill="#ffffff" />
          <g filter="url(#av-spaceui-goo)">
            <g transform="translate(32, 32)">
              <g transform="translate(-32, -32)">
                <circle cx="24.91" cy="42.29" r="6.33" fill="#59adef" />
                <circle cx="22.11" cy="15.92" r="4.64" fill="#0a1a4a" />
                <circle cx="15.67" cy="28.10" r="5.41" fill="#6073ff" />
                <circle cx="21.71" cy="25.75" r="5.21" fill="#1f4fd8" />
                <circle cx="46.37" cy="32.50" r="5.59" fill="#59adef" />
                <circle cx="43.13" cy="38.90" r="7.54" fill="#6073ff" />
                <circle cx="44.28" cy="15.99" r="6.48" fill="#59adef" />
                <circle cx="48.52" cy="32.90" r="5.59" fill="#0a1a4a" />
              </g>
            </g>
          </g>
          <rect x="0" y="0" width="64" height="64" fill="url(#av-spaceui-sheen)" />
        </g>
      </g>
    </svg>
  )
}
