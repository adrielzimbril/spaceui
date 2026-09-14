import localFont from 'next/font/local'

export const OpenRunde = localFont({
  src: [
    {
      path: './font-open-runde/open-runde-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './font-open-runde/open-runde-medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './font-open-runde/open-runde-semibold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './font-open-runde/open-runde-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-open-runde',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
})
