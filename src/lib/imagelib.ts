export interface ProjectImageItem {
  id: string
  name: string
  url: string
  description?: string
  width?: number
  height?: number
}

export interface ImageLibrary {
  tools: {
    imagesplit: ProjectImageItem[]
    [toolKey: string]: ProjectImageItem[]
  }
  [category: string]: Record<string, ProjectImageItem[]>
}

export const imagelib: ImageLibrary = {
  tools: {
    imagesplit: [
      {
        id: 'sample-monolith',
        name: 'Monolith Horizon',
        url: 'https://cdn.spaceui.one/atom/samples/image-1.png',
        description: 'Scenic landscape featuring a monolithic ring over a tranquil lake at sunset',
        width: 1672,
        height: 941,
      },
      {
        id: 'sample-portrait',
        name: 'Bloom Portrait',
        url: 'https://cdn.spaceui.one/atom/samples/image-2.png',
        description: 'Cinematic portrait with vivid blue eyes framed by soft orange petals and sunlight',
        width: 2912,
        height: 1632,
      },
      {
        id: 'sample-architecture',
        name: 'Oculus Coast',
        url: 'https://cdn.spaceui.one/atom/samples/image-6.png',
        description: 'Circular stone oculus opening looking onto a calm ocean sunset',
        width: 1672,
        height: 941,
      },
      {
        id: 'sample-archway',
        name: 'Stone Archway',
        url: 'https://cdn.spaceui.one/atom/samples/image-4.png',
        description: 'Fantasy landscape with a monumental natural stone bridge over a reflective river valley',
        width: 1672,
        height: 941,
      },
      {
        id: 'sample-botanical',
        name: 'Botanical Serenity',
        url: 'https://cdn.spaceui.one/atom/samples/image-5.png',
        description: 'Ethereal artistic portrait immersed in lush botanical foliage with dappled light',
        width: 1632,
        height: 918,
      },
    ],
    plush: [
      {
        id: 'spaceui',
        name: 'Space UI',
        url: 'https://cdn.spaceui.one/atom/samples/spaceui.png',
        description: 'Space UI brand emblem badge',
        width: 512,
        height: 512,
      },
      {
        id: 'logo',
        name: 'Logo',
        url: 'https://cdn.spaceui.one/atom/samples/logo.svg',
        description: 'Space UI emblem with blue glossy metaballs',
        width: 512,
        height: 512,
      },
      {
        id: 'squiggle',
        name: 'Squiggle',
        url: 'https://cdn.spaceui.one/atom/samples/squiggle.svg',
        description: 'Expressive golden squiggle face',
        width: 512,
        height: 512,
      },
      {
        id: 'squish',
        name: 'Squish',
        url: 'https://cdn.spaceui.one/atom/samples/squish.svg',
        description: 'Cute squish creature with pastel gradient',
        width: 1000,
        height: 1000,
      },
      {
        id: 'invader',
        name: 'Invader',
        url: 'https://cdn.spaceui.one/atom/samples/invader.svg',
        description: 'Retro pixel space invader',
        width: 512,
        height: 512,
      },
      {
        id: 'lumina',
        name: 'Lumina',
        url: 'https://cdn.spaceui.one/atom/samples/lumina.svg',
        description: 'Lumina space avatar',
        width: 512,
        height: 512,
      },
      {
        id: 'glitch',
        name: 'Glitch',
        url: 'https://cdn.spaceui.one/atom/samples/glitch.svg',
        description: 'Glitch SPACEavatar',
        width: 512,
        height: 512,
      },
      {
        id: 'doddle',
        name: 'Doddle',
        url: 'https://cdn.spaceui.one/atom/samples/doddle.svg',
        description: 'Whimsical doodle illustration on off-white',
        width: 512,
        height: 512,
      },
      {
        id: 'kendo',
        name: 'Kendo',
        url: 'https://cdn.spaceui.one/atom/samples/kendo.svg',
        description: 'Kendo warrior avatar on obsidian plush',
        width: 512,
        height: 512,
      },
      {
        id: 'image-1',
        name: 'Monolith',
        url: 'https://cdn.spaceui.one/atom/samples/image-1.png',
        description: 'Scenic monolithic ring landscape',
        width: 1672,
        height: 941,
      },
    ],
    reveal: [
      {
        id: 'twilight-ring',
        name: 'Twilight Ring',
        url: 'https://cdn.spaceui.one/atom/samples/image-1.png',
        description: 'Luminous ring sculpture hovering over coastal waters at dusk',
        width: 1672,
        height: 941,
      },
      {
        id: 'twilight-silhouette',
        name: 'Twilight Silhouette',
        url: 'https://cdn.spaceui.one/atom/samples/image-15.png',
        description: 'Motion-blurred woman profile against dusky twilight mountain horizon',
        width: 1632,
        height: 2912,
      },
      {
        id: 'blossom-arch',
        name: 'Blossom Arch',
        url: 'https://cdn.spaceui.one/atom/samples/image-4.png',
        description: 'Curved stone archway framed by cascading cherry blossoms',
        width: 1672,
        height: 941,
      },
      {
        id: 'prism-portrait',
        name: 'Prism Portrait',
        url: 'https://cdn.spaceui.one/atom/samples/image-27.png',
        description: 'Studio portrait split by red and blue spectral prism light',
        width: 3712,
        height: 5120,
      },
      {
        id: 'flora-portrait',
        name: 'Flora Portrait',
        url: 'https://cdn.spaceui.one/atom/samples/image-2.png',
        description: 'Artistic portrait draped with vibrant blooming botanical florals',
        width: 2912,
        height: 1632,
      },
      {
        id: 'cobalt-gaze',
        name: 'Cobalt Gaze',
        url: 'https://cdn.spaceui.one/atom/samples/image-30.png',
        description: 'Intense macro gaze veiled behind soft cobalt blue flower petals',
        width: 2464,
        height: 1856,
      },
      {
        id: 'cosmic-ring',
        name: 'Cosmic Ring',
        url: 'https://cdn.spaceui.one/atom/samples/image-24.png',
        description: 'Geometric orbital ring glowing against a deep cosmic background',
        width: 1672,
        height: 941,
      },
      {
        id: 'cosmic-wave',
        name: 'Cosmic Wave',
        url: 'https://cdn.spaceui.one/atom/samples/image-28.png',
        description: 'Luminous undulating nebular space ribbons in deep galaxy hues',
        width: 2912,
        height: 1632,
      },
      {
        id: 'astronaut-visor',
        name: 'Astronaut Visor',
        url: 'https://cdn.spaceui.one/atom/samples/image-40.png',
        description: 'Sleek astronaut helmet with reflective gold rim against deep black cosmos',
        width: 1632,
        height: 2912,
      },
      {
        id: 'cyber-visor',
        name: 'Cyber Visor',
        url: 'https://cdn.spaceui.one/atom/samples/image-12.png',
        description: 'Futuristic cyberpunk portrait with illuminated metallic visor',
        width: 2464,
        height: 1856,
      },
    ],
  },
}

export default imagelib
