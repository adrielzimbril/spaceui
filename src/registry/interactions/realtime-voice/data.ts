export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking'

export interface VoiceDialogueTurn {
  id: string
  /** User spoken input */
  listen: string
  /** Thought process / research summary */
  think: string
  /** Assistant spoken output */
  speak: string
  /** Optional custom duration overrides in milliseconds */
  durations?: {
    listening?: number
    thinking?: number
    speaking?: number
  }
}

export interface VoicePreset {
  id: string
  title: string
  description: string
  modelName: string
  category: string
  dialogues: VoiceDialogueTurn[]
}

export type VoicePresetKey = 'developer' | 'designer' | 'orchestrator' | 'incident' | 'podcast' | 'copilot'

import { hexToRgb, BLOOP_PALETTES, BloopPaletteName } from '@/registry/components/orb/bloop/palettes'

export const DEFAULT_VOICE_DURATIONS: Record<VoiceState, number> = {
  idle: 2200,
  listening: 3200,
  thinking: 2400,
  speaking: 4400,
}

export const VOICE_STATE_META = {
  idle: {
    label: 'Standby',
    badgeVariant: 'secondary' as const,
    colorHex: '#94a3b8',
    textClass: 'text-muted-foreground',
    bloopState: 'idle' as const,
    bloopColors: {
      main: hexToRgb('#F1F5F9'),
      low: hexToRgb('#64748B'),
      mid: hexToRgb('#CBD5E1'),
      high: hexToRgb('#FFFFFF'),
    },
  },
  listening: {
    label: 'Listening',
    badgeVariant: 'info' as const,
    colorHex: '#0181FE',
    textClass: 'text-blue-600 dark:text-blue-400',
    bloopState: 'listen' as const,
    bloopColors: BLOOP_PALETTES[BloopPaletteName.blue],
  },
  thinking: {
    label: 'Thinking',
    badgeVariant: 'warning' as const,
    colorHex: '#FF8D00',
    textClass: 'text-amber-600 dark:text-amber-400',
    bloopState: 'think' as const,
    bloopColors: {
      main: hexToRgb('#FFF8DC'),
      low: hexToRgb('#FF8D00'),
      mid: hexToRgb('#FFE073'),
      high: hexToRgb('#FFFDEF'),
    },
  },
  speaking: {
    label: 'Speaking',
    badgeVariant: 'success' as const,
    colorHex: '#00D668',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    bloopState: 'speak' as const,
    bloopColors: {
      main: hexToRgb('#DCFFF0'),
      low: hexToRgb('#00D668'),
      mid: hexToRgb('#96FFCA'),
      high: hexToRgb('#FFFDEF'),
    },
  },
}

export const VOICE_PRESETS: Record<VoicePresetKey, VoicePreset> = {
  developer: {
    id: 'developer',
    title: 'Dev & Performance',
    description: 'GPU profiling, bundle size analysis, and garbage collection',
    modelName: 'Claude 3.7 Sonnet',
    category: 'Engineering',
    dialogues: [
      {
        id: 'dev-gpu',
        listen: 'Why is the canvas frame rate dropping on mobile?',
        think: 'Profiling requestAnimationFrame loop and GPU render targets…',
        speak:
          "You're creating garbage collection pressure in the draw loop, Adriel. Cache the Float32Array buffers outside the render callback.",
      },
      {
        id: 'dev-bundle',
        listen: 'Run the bundle analyzer on the landing page.',
        think: 'Parsing client chunks and tree-shaking dead modules…',
        speak: 'Tree-shaking removed 140 kilobytes of unused icons. Cold boot is now under 200 milliseconds.',
      },
    ],
  },
  designer: {
    id: 'designer',
    title: 'Design & Motion',
    description: 'OKLCH color scales, squircle geometry, and spring physics',
    modelName: 'Gemini 2.0 Flash',
    category: 'Design',
    dialogues: [
      {
        id: 'design-contrast',
        listen: 'Does this squircle button meet AAA contrast in dark mode?',
        think: 'Calculating APCA luminance on dark surface with OKLCH tokens…',
        speak:
          'It hits 8.4 to 1 on Space UI tokens. Boost chroma by 0.03 to give the active border a subtle electric rim.',
      },
      {
        id: 'design-spring',
        listen: 'How should the modal enter animation feel?',
        think: 'Tuning spring stiffness, mass, and damping coefficients…',
        speak: 'Use a snappy spring: stiffness 420, damping 30, with a 6-pixel upward translation.',
      },
    ],
  },
  orchestrator: {
    id: 'orchestrator',
    title: 'Agent Fleet',
    description: 'Agent task delegation, security audits, and research synthesis',
    modelName: 'DeepSeek-V3 Live',
    category: 'Agents',
    dialogues: [
      {
        id: 'arch-audit',
        listen: 'Delegate the security audit to the red-team agent.',
        think: 'Spawning sandbox runner and provisioning read-only tokens…',
        speak: 'Agent dispatched, Poteto. Scanning API endpoints and verifying OAuth token revocation now.',
      },
      {
        id: 'arch-research',
        listen: 'Did the research agent synthesize the competitor release?',
        think: 'Extracting changelog diffs and vectorizing key features…',
        speak: 'Completed. They added streaming tool calls. The executive brief is ready in your workspace.',
      },
    ],
  },
  incident: {
    id: 'incident',
    title: 'SRE War Room',
    description: 'Edge node packet routing, latency spikes, and pool health',
    modelName: 'GPT-4o Realtime',
    category: 'Operations',
    dialogues: [
      {
        id: 'inc-edge',
        listen: 'What is the status on the European edge cluster?',
        think: 'Pinging Frankfurt and London edge nodes for p99 latency…',
        speak: 'Latency spiked to 380ms due to upstream packet loss, Adriel. Rerouting traffic through Stockholm now.',
      },
      {
        id: 'inc-pool',
        listen: 'Are the database connection pools stabilizing?',
        think: 'Inspecting read-replica replication lag and connection pool saturation…',
        speak: 'All replicas are healthy. Connection pool utilization dropped back to 32 percent.',
      },
    ],
  },
  podcast: {
    id: 'podcast',
    title: 'Podcast Co-Host',
    description: 'Dynamic conversation, tech discussions, and listener engagement',
    modelName: 'ElevenLabs Voice',
    category: 'Media',
    dialogues: [
      {
        id: 'pod-intro',
        listen: "Let's introduce our new physics engine to the listeners.",
        think: 'Structuring opening hook with key differentiators and WebGPU speedups…',
        speak:
          'Welcome back everyone to Space UI Live! Today we are unveiling a WebGPU runtime that hits sixty frames per second on any device.',
      },
      {
        id: 'pod-takeaway',
        listen: "What's the main takeaway for React developers?",
        think: 'Highlighting zero-config setup and hook ergonomics…',
        speak: 'Zero boilerplate. Wrap your canvas in a single hook, and spring physics just work.',
      },
    ],
  },
  copilot: {
    id: 'copilot',
    title: 'Founder Copilot',
    description: 'Daily priorities, calendar management, and release notes',
    modelName: 'Claude 3.5 Sonnet',
    category: 'Productivity',
    dialogues: [
      {
        id: 'co-priorities',
        listen: 'Summarize my morning priority list.',
        think: 'Sorting calendar conflicts and pull request review requests…',
        speak:
          "You have three urgent PR reviews, Poteto, and the design critique at 10 AM. I've cleared your afternoon.",
      },
      {
        id: 'co-changelog',
        listen: 'Draft a release note for the v2.4 launch.',
        think: 'Fetching merged commits and benchmark improvements…',
        speak: 'Changelog drafted. Key highlights are the new Bloop Orb visualizer and FastStart MP4 exports.',
      },
    ],
  },
}
