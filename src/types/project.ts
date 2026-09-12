export interface ProjectPreviewImage {
  format: string
  resolution: string
  width: number
  height: number
  size: number
  size_human: string
  url: string
}

export interface ProjectPreviewVideo {
  format: string
  size: number
  size_human: string
  url: string
}

export interface ProjectPreview {
  image: ProjectPreviewImage
  video?: ProjectPreviewVideo
}

export interface ProjectItem {
  number: number
  name: string
  title: string
  headline: string
  description: string
  url: string
  repo: string
  repo_url: string
  isPro: boolean
  preview: ProjectPreview
  created_at: string
  updated_at: string
  timestamp: string
}

export interface ProjectsData {
  projects: ProjectItem[]
  total: number
}
