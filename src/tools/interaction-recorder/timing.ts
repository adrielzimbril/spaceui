import { AGENT_PRESETS, type PresetKey } from '@/registry/interactions/agent-pipeline/data'
import { DEPLOY_FLOWS, type DeployFlowKey } from '@/registry/interactions/deploy-pipeline/data'
import {
  DEFAULT_VOICE_DURATIONS,
  VOICE_PRESETS,
  type VoicePresetKey,
} from '@/registry/interactions/realtime-voice/data'

export interface SequenceTiming {
  /** Duration of 1 complete sequence cycle in seconds */
  unitDurationSeconds: number
  /** Total duration for the requested number of loops in seconds */
  totalDurationSeconds: number
  /** Short scope title, e.g. "1 Preset · 2 Flows" or "All 4 Presets · 8 Flows" */
  scopeLabel: string
  /** Detailed subtitle description, e.g. "Incident: Resolved → Failed" */
  detailLabel: string
  /** Number of presets included in 1 sequence cycle */
  presetsCount: number
  /** Number of flows included in 1 sequence cycle */
  flowsCount: number
}

function calculateAgentFlowDuration(
  flow: { outcome: string; agents: Array<{ workS: number; isError?: boolean }> },
  travelDuration: number,
  speed: number,
): number {
  let elapsed = 0
  for (let i = 0; i < flow.agents.length; i++) {
    const agent = flow.agents[i]
    elapsed += agent.workS
    if (agent.isError) {
      break
    }
    if (i < flow.agents.length - 1) {
      elapsed += travelDuration
    }
  }
  const rawDuration = Math.max(elapsed, 0.5)
  // End display delay before looping / advancing
  const postDelay = flow.outcome === 'error' ? 2.2 : 1.8
  return (rawDuration + postDelay) / Math.max(speed, 0.1)
}

function calculateAgentPipelineTiming(props: Record<string, any>, loops: number): SequenceTiming {
  const presetKey: PresetKey = (props.preset as PresetKey) || 'incident'
  const flowId = props.flow || 'success'
  const willCyclePresets = Boolean(props.cyclePresets ?? props.cyclePreset)
  const willCycleFlows = Boolean(props.cycleFlows ?? props.cycleFlow)
  const speed = typeof props.speed === 'number' && props.speed > 0 ? props.speed : 1
  const travelDuration = typeof props.travelDuration === 'number' ? props.travelDuration : 0.6

  const allPresetKeys = Object.keys(AGENT_PRESETS) as PresetKey[]
  const currentPreset = AGENT_PRESETS[presetKey] ?? AGENT_PRESETS.incident

  if (willCyclePresets && willCycleFlows) {
    // All presets, all flows
    let totalUnit = 0
    let totalFlows = 0
    for (const pKey of allPresetKeys) {
      const p = AGENT_PRESETS[pKey]
      for (const f of p.flows) {
        totalUnit += calculateAgentFlowDuration(f, travelDuration, speed)
        totalFlows++
      }
    }
    return {
      unitDurationSeconds: totalUnit,
      totalDurationSeconds: totalUnit * loops,
      scopeLabel: `All ${allPresetKeys.length} Presets · ${totalFlows} Flows`,
      detailLabel: `Full matrix cycle`,
      presetsCount: allPresetKeys.length,
      flowsCount: totalFlows,
    }
  }

  if (willCyclePresets && !willCycleFlows) {
    // All presets, single selected flow variant
    let totalUnit = 0
    for (const pKey of allPresetKeys) {
      const p = AGENT_PRESETS[pKey]
      const f = p.flows.find((item) => item.id === flowId) ?? p.flows[0]
      totalUnit += calculateAgentFlowDuration(f, travelDuration, speed)
    }
    return {
      unitDurationSeconds: totalUnit,
      totalDurationSeconds: totalUnit * loops,
      scopeLabel: `All ${allPresetKeys.length} Presets · Flow: ${flowId}`,
      detailLabel: `Cycling presets on "${flowId}" variant`,
      presetsCount: allPresetKeys.length,
      flowsCount: allPresetKeys.length,
    }
  }

  if (!willCyclePresets && willCycleFlows) {
    // Single preset, all flows
    let totalUnit = 0
    for (const f of currentPreset.flows) {
      totalUnit += calculateAgentFlowDuration(f, travelDuration, speed)
    }
    const flowLabels = currentPreset.flows.map((f) => f.id).join(' → ')
    return {
      unitDurationSeconds: totalUnit,
      totalDurationSeconds: totalUnit * loops,
      scopeLabel: `${currentPreset.name} · ${currentPreset.flows.length} Flows`,
      detailLabel: `Flows: ${flowLabels}`,
      presetsCount: 1,
      flowsCount: currentPreset.flows.length,
    }
  }

  // Single preset, single flow
  const singleFlow = currentPreset.flows.find((f) => f.id === flowId) ?? currentPreset.flows[0]
  const unitSeconds = calculateAgentFlowDuration(singleFlow, travelDuration, speed)
  return {
    unitDurationSeconds: unitSeconds,
    totalDurationSeconds: unitSeconds * loops,
    scopeLabel: `${currentPreset.name} · Flow: ${singleFlow.label}`,
    detailLabel: `Single flow (${singleFlow.id})`,
    presetsCount: 1,
    flowsCount: 1,
  }
}

function calculateDeployPipelineTiming(props: Record<string, any>, loops: number): SequenceTiming {
  const flowKey: DeployFlowKey = (props.flow as DeployFlowKey) || 'production'
  const willCycleFlows = Boolean(props.cycleFlows ?? props.cycleFlow)
  const speed = typeof props.speed === 'number' && props.speed > 0 ? props.speed : 1

  const allFlowKeys = Object.keys(DEPLOY_FLOWS) as DeployFlowKey[]

  const getFlowDuration = (key: DeployFlowKey) => {
    const flow = DEPLOY_FLOWS[key]
    if (!flow?.cycle) return 10 / speed
    const ms = flow.cycle.reduce((sum, f) => sum + (f.durationMs || 1000), 0)
    return Math.max(ms / 1000 / Math.max(speed, 0.1), 1)
  }

  if (willCycleFlows) {
    let totalUnit = 0
    for (const k of allFlowKeys) {
      totalUnit += getFlowDuration(k)
    }
    return {
      unitDurationSeconds: totalUnit,
      totalDurationSeconds: totalUnit * loops,
      scopeLabel: `All ${allFlowKeys.length} Flows`,
      detailLabel: `Full flow sequence (${allFlowKeys.join(', ')}) at ${speed}×`,
      presetsCount: 1,
      flowsCount: allFlowKeys.length,
    }
  }

  const unitSeconds = getFlowDuration(flowKey)
  const currentFlow = DEPLOY_FLOWS[flowKey]
  return {
    unitDurationSeconds: unitSeconds,
    totalDurationSeconds: unitSeconds * loops,
    scopeLabel: `Flow: ${currentFlow?.title ?? flowKey}`,
    detailLabel: `Single flow variant at ${speed}×`,
    presetsCount: 1,
    flowsCount: 1,
  }
}

function calculateRealtimeVoiceTiming(props: Record<string, any>, loops: number): SequenceTiming {
  const presetKey: VoicePresetKey = (props.preset as VoicePresetKey) || 'developer'
  const willCyclePresets = Boolean(props.cyclePresets ?? props.cyclePreset ?? true)
  const speed = typeof props.speed === 'number' && props.speed > 0 ? props.speed : 1

  const allPresetKeys = Object.keys(VOICE_PRESETS) as VoicePresetKey[]
  const targetPresets = willCyclePresets ? allPresetKeys : [presetKey]

  let totalUnitSeconds = 0
  let totalDialogues = 0

  for (const pKey of targetPresets) {
    const preset = VOICE_PRESETS[pKey] ?? VOICE_PRESETS.developer
    for (const d of preset.dialogues) {
      const listenMs = d.durations?.listening ?? DEFAULT_VOICE_DURATIONS.listening
      const thinkMs = d.durations?.thinking ?? DEFAULT_VOICE_DURATIONS.thinking
      const speakMs = d.durations?.speaking ?? DEFAULT_VOICE_DURATIONS.speaking
      totalUnitSeconds += (listenMs + thinkMs + speakMs) / 1000 / speed
      totalDialogues++
    }
  }

  const currentPreset = VOICE_PRESETS[presetKey] ?? VOICE_PRESETS.developer
  return {
    unitDurationSeconds: totalUnitSeconds,
    totalDurationSeconds: totalUnitSeconds * loops,
    scopeLabel: willCyclePresets
      ? `All ${allPresetKeys.length} Presets · ${totalDialogues} Turns`
      : `${currentPreset.title} · ${totalDialogues} Turns`,
    detailLabel: willCyclePresets
      ? `Full conversational cycle across all presets at ${speed}×`
      : `Single scenario dialogue at ${speed}×`,
    presetsCount: targetPresets.length,
    flowsCount: totalDialogues,
  }
}

/**
 * Computes exact duration & human breakdown for any interaction sequence
 * based on current Tweakpane props and requested loop count.
 */
export function computeSequenceTiming(
  itemName: string | null | undefined,
  props: Record<string, any>,
  loops: number,
  fallbackCycleSeconds: number | null = null,
): SequenceTiming {
  const safeLoops = Math.max(1, loops)

  if (itemName?.includes('agent-pipeline')) {
    return calculateAgentPipelineTiming(props, safeLoops)
  }

  if (itemName?.includes('deploy-pipeline')) {
    return calculateDeployPipelineTiming(props, safeLoops)
  }

  if (itemName?.includes('realtime-voice')) {
    return calculateRealtimeVoiceTiming(props, safeLoops)
  }

  // Fallback for generic interactions
  const speed = typeof props.speed === 'number' && props.speed > 0 ? props.speed : 1
  const baseSeconds = fallbackCycleSeconds ?? 10
  const unit = baseSeconds / speed
  return {
    unitDurationSeconds: unit,
    totalDurationSeconds: unit * safeLoops,
    scopeLabel: `Standard Cycle`,
    detailLabel: `Generic sequence at ${speed}×`,
    presetsCount: 1,
    flowsCount: 1,
  }
}
