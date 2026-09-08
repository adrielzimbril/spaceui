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
        url: '/samples/image-1.png',
        description: 'Scenic landscape featuring a monolithic ring over a tranquil lake at sunset',
        width: 1672,
        height: 941,
      },
      {
        id: 'sample-portrait',
        name: 'Bloom Portrait',
        url: '/samples/image-2.png',
        description: 'Cinematic portrait with vivid blue eyes framed by soft orange petals and sunlight',
        width: 2912,
        height: 1632,
      },
      {
        id: 'sample-architecture',
        name: 'Forest Villa',
        url: '/samples/image-3.png',
        description: 'Modern minimalist architectural pavilion nestled in a moody autumnal woodland',
        width: 2912,
        height: 1632,
      },
      {
        id: 'sample-archway',
        name: 'Stone Archway',
        url: '/samples/image-4.png',
        description: 'Fantasy landscape with a monumental natural stone bridge over a reflective river valley',
        width: 1672,
        height: 941,
      },
      {
        id: 'sample-botanical',
        name: 'Botanical Serenity',
        url: '/samples/image-5.png',
        description: 'Ethereal artistic portrait immersed in lush botanical foliage with dappled light',
        width: 1632,
        height: 918,
      },
    ],
  },
}

export default imagelib
