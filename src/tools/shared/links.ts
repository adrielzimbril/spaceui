export type ToolOutboundLinks = {
  github?: string
  figma?: string
  plugin?: string
}

export const TOOL_OUTBOUND = {
  avatars: {
    github: 'https://github.com/usespaceui/avatars',
    figma: 'https://www.figma.com/community/plugin/1678488872162168475',
  },
  squishmoji: {
    github: 'https://github.com/usespaceui/squishmoji',
    figma: 'https://www.figma.com/community/plugin/1678488872162168475',
  },
  emoji: {
    github: 'https://github.com/usespaceui/emoji',
  },
} satisfies Record<string, ToolOutboundLinks>
