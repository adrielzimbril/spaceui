import type { AvatarVariant } from '@usespaceui/avatars'

export interface SelectedAvatar {
  seed: string
  variant: AvatarVariant | 'all'
  colors?: string[]
}
