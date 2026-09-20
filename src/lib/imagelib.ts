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
        id: 'monolith-front',
        name: 'Monolith Horizon (Front)',
        url: 'https://cdn.spaceui.one/atom/samples/image-0-f.png',
        description: 'Monolith Horizon foreground element',
        width: 1672,
        height: 941,
      },
      {
        id: 'monolith-back',
        name: 'Monolith Horizon (Back)',
        url: 'https://cdn.spaceui.one/atom/samples/image-0-b.png',
        description: 'Monolith Horizon background environment',
        width: 1672,
        height: 941,
      },
      {
        id: 'twilight-ring-front',
        name: 'Twilight Ring (Front)',
        url: 'https://cdn.spaceui.one/atom/samples/image-1-f.png',
        description: 'Luminous ring sculpture foreground',
        width: 2730,
        height: 1536,
      },
      {
        id: 'twilight-ring-back',
        name: 'Twilight Ring (Back)',
        url: 'https://cdn.spaceui.one/atom/samples/image-1-b.png',
        description: 'Coastal waters dusk background',
        width: 1672,
        height: 941,
      },
      {
        id: 'flora-portrait-front',
        name: 'Flora Portrait (Front)',
        url: 'https://cdn.spaceui.one/atom/samples/image-2-f.png',
        description: 'Artistic portrait foreground character',
        width: 1536,
        height: 1024,
      },
      {
        id: 'flora-portrait-back',
        name: 'Flora Portrait (Back)',
        url: 'https://cdn.spaceui.one/atom/samples/image-2-b.png',
        description: 'Blooming botanical floral background',
        width: 1536,
        height: 1024,
      },
      {
        id: 'forest-sanctum-front',
        name: 'Forest Sanctum (Front)',
        url: 'https://cdn.spaceui.one/atom/samples/image-3-f.png',
        description: 'Modern wooden pavilion structure',
        width: 1536,
        height: 1024,
      },
      {
        id: 'forest-sanctum-back',
        name: 'Forest Sanctum (Back)',
        url: 'https://cdn.spaceui.one/atom/samples/image-3-b.png',
        description: 'Misty pine forest landscape background',
        width: 1536,
        height: 1024,
      },
    ],
  },
}

export default imagelib
