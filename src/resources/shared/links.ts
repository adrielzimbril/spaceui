export type ToolOutboundLinks = {
  github?: string
  figma?: string
  plugin?: string
}

export const TOOL_OUTBOUND = {
  avatars: {
    github: 'https://github.com/usespaceui/avatars',
  },
  squishmoji: {
    github: 'https://github.com/usespaceui/squishmoji',
  },
  emoji: {
    github: 'https://github.com/usespaceui/emoji',
  },
} satisfies Record<string, ToolOutboundLinks>
