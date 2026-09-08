export const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://www.spaceui.one/#website',
      url: 'https://www.spaceui.one',
      name: 'Space UI',
      description:
        'An open-source design library built for humans and AI to create expressive, polished, and high-quality interfaces, helping you build better products, faster',
      inLanguage: 'en',
      publisher: {
        '@id': 'https://www.spaceui.one/#organization',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://www.spaceui.one/#organization',
      name: 'Space UI',
      url: 'https://www.spaceui.one',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.spaceui.one/icon-logo.png',
        width: 512,
        height: 512,
      },
    },
  ],
}
