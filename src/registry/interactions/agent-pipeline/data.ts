export interface AgentStep {
  id: string
  name: string
  role: string
  seed: string
  action: string
  note: string
  steps: string[]
  workS: number
  isError?: boolean
  errorStepIndex?: number
  errorNote?: string
}

export interface AgentFlow {
  id: 'success' | 'error'
  label: string
  taskTitle: string
  outcome: 'success' | 'error'
  agents: AgentStep[]
}

export interface AgentPreset {
  id: string
  name: string
  flows: AgentFlow[]
}

export const AGENT_PRESETS: Record<string, AgentPreset> = {
  incident: {
    id: 'incident',
    name: 'SRE Incident Remediation',
    flows: [
      {
        id: 'success',
        label: 'Resolved (Canary Passed)',
        taskTitle: 'Resolve high p99 latency spike on checkout-api',
        outcome: 'success',
        agents: [
          {
            id: 'sentinel',
            name: 'Sentinel',
            role: 'Detector',
            seed: 'sentinel',
            action: 'triaging telemetry anomalies',
            note: 'DB pool exhausted: root cause isolated',
            steps: ['ingesting Datadog alerts', 'isolating affected pods: us-east-1', 'flagging DB pool starvation'],
            workS: 1.8,
          },
          {
            id: 'investigator',
            name: 'Trace',
            role: 'Analyst',
            seed: 'investigator',
            action: 'inspecting transaction traces',
            note: 'Unindexed join identified on orders_v2',
            steps: ['correlating slow query logs', 'found unindexed join on orders_v2', 'reproducing lock contention'],
            workS: 2.4,
          },
          {
            id: 'patcher',
            name: 'Patcher',
            role: 'Engineer',
            seed: 'patcher',
            action: 'generating migration patch',
            note: 'Hotfix #4102 ready and validated',
            steps: [
              'drafting concurrent index migration',
              'running dry-run on staging DB',
              'building container hotfix',
            ],
            workS: 2.2,
          },
          {
            id: 'gatekeeper',
            name: 'Gatekeeper',
            role: 'Approver',
            seed: 'gatekeeper',
            action: 'monitoring canary deployment',
            note: 'Incident resolved · p99 normal (42ms)',
            steps: ['rolling out 5% canary traffic', 'p99 dropped from 840ms to 42ms', 'promoting 100% rollout'],
            workS: 1.8,
          },
        ],
      },
      {
        id: 'error',
        label: 'Failed (Deadlock Contention)',
        taskTitle: 'Hotfix lock contention on orders_v2 migration',
        outcome: 'error',
        agents: [
          {
            id: 'sentinel',
            name: 'Sentinel',
            role: 'Detector',
            seed: 'sentinel',
            action: 'triaging telemetry anomalies',
            note: 'Deadlock cascade detected in us-east-1',
            steps: ['ingesting Datadog alerts', 'alert: 12 DB worker threads blocked', 'escalating to hotfix analyst'],
            workS: 1.6,
          },
          {
            id: 'investigator',
            name: 'Trace',
            role: 'Analyst',
            seed: 'investigator',
            action: 'attempting lock release',
            note: 'Fatal: DB lock acquisition timeout (>30s)',
            steps: [
              'inspecting active transaction table',
              'attempting graceful query kill',
              'lock timeout exceeded: aborting',
            ],
            workS: 2.2,
            isError: true,
            errorStepIndex: 2,
            errorNote: 'Deadlock detected: aborting pipeline to prevent cluster panic',
          },
          {
            id: 'patcher',
            name: 'Patcher',
            role: 'Engineer',
            seed: 'patcher',
            action: 'standby for migration retry',
            note: 'Standing by for cluster reboot',
            steps: ['patch cancelled', 'holding dry-run'],
            workS: 1.5,
          },
          {
            id: 'gatekeeper',
            name: 'Gatekeeper',
            role: 'Approver',
            seed: 'gatekeeper',
            action: 'awaiting manual override',
            note: 'Rolled back to checkpoint #4099',
            steps: ['verifying safe rollback', 'paging on-call lead'],
            workS: 1.5,
          },
        ],
      },
    ],
  },
  codereview: {
    id: 'codereview',
    name: 'AI Code Review & PR',
    flows: [
      {
        id: 'success',
        label: 'Approved & Merged',
        taskTitle: 'Refactor auth session store to edge KV',
        outcome: 'success',
        agents: [
          {
            id: 'linter',
            name: 'Linter',
            role: 'AST Auditor',
            seed: 'linter',
            action: 'scanning AST for memory leaks',
            note: '2 blocking calls flagged in middleware',
            steps: [
              'analyzing imports & scope',
              'flagging blocking fs calls in middleware',
              'checking OWASP session guidelines',
            ],
            workS: 1.8,
          },
          {
            id: 'architect',
            name: 'Architect',
            role: 'Refactor Bot',
            seed: 'architect',
            action: 'converting storage to Vercel KV',
            note: 'Stateless token rotation implemented',
            steps: [
              'swapping cookie parser to jose JWT',
              'introducing Redis pipeline get/set',
              'adding atomic token rotation',
            ],
            workS: 2.4,
          },
          {
            id: 'testbot',
            name: 'Testbot',
            role: 'QA Simulator',
            seed: 'testbot',
            action: 'running 42 edge integration tests',
            note: 'All 42 tests passed with 0 warnings',
            steps: [
              'spinning up mock edge runtime',
              'simulating race condition on refresh',
              'benchmarking sub-5ms latency',
            ],
            workS: 2.2,
          },
          {
            id: 'maintainer',
            name: 'Maintainer',
            role: 'Approver',
            seed: 'maintainer',
            action: 'verifying sign-off & merging PR',
            note: 'PR #884 merged to main successfully',
            steps: ['cryptographic commit sign verified', 'updating changelog & semver', 'squash & merge to main'],
            workS: 1.8,
          },
        ],
      },
      {
        id: 'error',
        label: 'Failed (Integration Tests)',
        taskTitle: 'Audit token rotation race conditions in PR #889',
        outcome: 'error',
        agents: [
          {
            id: 'linter',
            name: 'Linter',
            role: 'AST Auditor',
            seed: 'linter',
            action: 'scanning syntax and typings',
            note: 'Types clean · AST check passed',
            steps: ['linting changed files', 'typecheck 0 errors', 'dispatching to refactor bot'],
            workS: 1.6,
          },
          {
            id: 'architect',
            name: 'Architect',
            role: 'Refactor Bot',
            seed: 'architect',
            action: 'bundling rotation middleware',
            note: 'Bundle compiled: ready for test run',
            steps: ['building middleware bundle', 'minification complete', 'generating source maps'],
            workS: 2.0,
          },
          {
            id: 'testbot',
            name: 'Testbot',
            role: 'QA Simulator',
            seed: 'testbot',
            action: 'running concurrency stress tests',
            note: 'AssertionError: Token replay detected (Test #14)',
            steps: [
              'firing 200 concurrent requests',
              'replay window mismatch',
              'Test #14 failed: token replay not blocked',
            ],
            workS: 2.2,
            isError: true,
            errorStepIndex: 2,
            errorNote: 'Integration test failed: Token replay security vulnerability detected',
          },
          {
            id: 'maintainer',
            name: 'Maintainer',
            role: 'Approver',
            seed: 'maintainer',
            action: 'blocking PR merge',
            note: 'PR blocked: awaiting bug fix',
            steps: ['merge blocked', 'requesting author changes'],
            workS: 1.5,
          },
        ],
      },
    ],
  },
  support: {
    id: 'support',
    name: 'Customer Success VIP',
    flows: [
      {
        id: 'success',
        label: 'Credit Authorized',
        taskTitle: 'Reconcile enterprise seat overage #ACME-2026',
        outcome: 'success',
        agents: [
          {
            id: 'classifier',
            name: 'Classifier',
            role: 'Support Bot',
            seed: 'triage',
            action: 'triaging enterprise ticket',
            note: 'Tier 1 account flagged for tier reconciliation',
            steps: [
              'evaluating SLA: Tier 1 Enterprise',
              'extracting contract terms & commit',
              'escalating to billing ops',
            ],
            workS: 1.8,
          },
          {
            id: 'auditor',
            name: 'Auditor',
            role: 'Ledger Analyst',
            seed: 'researcher',
            action: 'reconciling seat audit logs',
            note: 'Discrepancy confirmed: $3,450 credit due',
            steps: [
              'querying SCIM provisioning events',
              'detected 24 de-provisioned seats not credited',
              'calculating $3,450 delta',
            ],
            workS: 2.4,
          },
          {
            id: 'negotiator',
            name: 'Negotiator',
            role: 'Strategist',
            seed: 'writer',
            action: 'drafting credit & renewal terms',
            note: 'Credit memo & executive note prepared',
            steps: [
              'generating credit invoice memo',
              'bundling Q4 tier discount proposal',
              'drafting personalized response',
            ],
            workS: 2.2,
          },
          {
            id: 'director',
            name: 'Director',
            role: 'VP Approver',
            seed: 'reviewer',
            action: 'authorizing credit release',
            note: 'Credit released · VIP renewal secured',
            steps: ['verifying budget threshold', 'dispatching signed credit memo', 'booking executive check-in call'],
            workS: 1.8,
          },
        ],
      },
      {
        id: 'error',
        label: 'Rejected (Limit Exceeded)',
        taskTitle: 'Evaluate $12,000 refund request for contract #ENT-77',
        outcome: 'error',
        agents: [
          {
            id: 'classifier',
            name: 'Classifier',
            role: 'Support Bot',
            seed: 'triage',
            action: 'evaluating refund request',
            note: 'High value refund (>10k) flagged',
            steps: [
              'ticket parsed: refund request $12,000',
              'checking account spend history',
              'escalating to ledger auditor',
            ],
            workS: 1.6,
          },
          {
            id: 'auditor',
            name: 'Auditor',
            role: 'Ledger Analyst',
            seed: 'researcher',
            action: 'validating terms against MSA',
            note: 'MSA clause 4.2: Usage strictly non-refundable',
            steps: ['loading MSA signed contract', 'comparing active compute logs', 'clause 4.2 forbids usage refunds'],
            workS: 2.2,
            isError: true,
            errorStepIndex: 2,
            errorNote: 'Refund rejected: Usage SLA was met, MSA policy forbids retroactive refunds',
          },
          {
            id: 'negotiator',
            name: 'Negotiator',
            role: 'Strategist',
            seed: 'writer',
            action: 'preparing policy explanation',
            note: 'Policy rejection note prepared',
            steps: ['drafting respectful denial', 'offering tier migration alternative'],
            workS: 1.5,
          },
          {
            id: 'director',
            name: 'Director',
            role: 'VP Approver',
            seed: 'reviewer',
            action: 'confirming decision',
            note: 'Decision logged: case closed',
            steps: ['recording sign-off', 'closing escalation'],
            workS: 1.5,
          },
        ],
      },
    ],
  },
  growth: {
    id: 'growth',
    name: 'Growth & Winback Campaign',
    flows: [
      {
        id: 'success',
        label: 'Dispatched (1,280 Sent)',
        taskTitle: 'Trigger smart win-back sequence for churn-risk cohort',
        outcome: 'success',
        agents: [
          {
            id: 'segmenter',
            name: 'Segmenter',
            role: 'Data Scientist',
            seed: 'segmenter',
            action: 'clustering cohort drop-offs',
            note: '1,280 high-intent profiles targeted',
            steps: [
              'filtering accounts inactive > 45d',
              'clustering by previous top features',
              'isolating 1,280 high-LTV profiles',
            ],
            workS: 1.8,
          },
          {
            id: 'copywriter',
            name: 'Copywriter',
            role: 'Content Engine',
            seed: 'copywriter',
            action: 'generating contextual hooks',
            note: 'Personalized project hooks generated',
            steps: [
              "pulling user's last saved project title",
              'generating personalized subject lines',
              'A/B variant generation',
            ],
            workS: 2.2,
          },
          {
            id: 'designer',
            name: 'Designer',
            role: 'Creative Bot',
            seed: 'designer',
            action: 'rendering dynamic preview cards',
            note: 'Responsive asset previews baked',
            steps: [
              'generating live project preview SVGs',
              'optimizing dark/light email templates',
              'checking mobile email viewport',
            ],
            workS: 2.4,
          },
          {
            id: 'publisher',
            name: 'Publisher',
            role: 'Approver',
            seed: 'publisher',
            action: 'validating deliverability & queueing',
            note: 'Campaign live · 1,280 emails dispatched',
            steps: [
              'checking spam scores & DKIM',
              'staggering batch send: 200/min',
              'launching real-time open tracker',
            ],
            workS: 1.8,
          },
        ],
      },
      {
        id: 'error',
        label: 'Failed (DKIM SPF Mismatch)',
        taskTitle: 'Validate sender reputation for bulk outreach cohort',
        outcome: 'error',
        agents: [
          {
            id: 'segmenter',
            name: 'Segmenter',
            role: 'Data Scientist',
            seed: 'segmenter',
            action: 'clustering cohort',
            note: '850 profiles shortlisted',
            steps: ['filtering targeted domains', 'cohort export ready', 'transferring to copywriter'],
            workS: 1.6,
          },
          {
            id: 'copywriter',
            name: 'Copywriter',
            role: 'Content Engine',
            seed: 'copywriter',
            action: 'preparing dynamic templates',
            note: 'Templates compiled: 3 variants',
            steps: ['compiling HTML email body', 'injecting token variables', 'dispatching to publisher'],
            workS: 2.0,
          },
          {
            id: 'designer',
            name: 'Designer',
            role: 'Creative Bot',
            seed: 'designer',
            action: 'checking asset CDN links',
            note: 'Assets uploaded and cached',
            steps: ['verifying CDN edge cache', 'optimizing image sizes', 'relaying to publisher'],
            workS: 1.8,
          },
          {
            id: 'publisher',
            name: 'Publisher',
            role: 'Approver',
            seed: 'publisher',
            action: 'running pre-flight deliverability check',
            note: 'Deliverability check failed: DKIM key mismatch',
            steps: ['scanning DNS records', 'SPF record validated', 'DKIM signature mismatch on custom domain'],
            workS: 2.2,
            isError: true,
            errorStepIndex: 2,
            errorNote:
              'Deliverability alert: DKIM signature verification failed. Outreach halted to protect domain reputation',
          },
        ],
      },
    ],
  },
}

export type PresetKey = keyof typeof AGENT_PRESETS
