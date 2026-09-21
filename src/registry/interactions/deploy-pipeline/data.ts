export interface DeployPipelineStep {
  id: number
  title: string
  user: { name: string; avatar: string }
  description?: string
  activeDescription?: string
  completedDescription?: string
  errorDescription?: string
  isError?: boolean
}

export interface DeployPipelineStepState {
  status: 'completed' | 'active' | 'pending' | 'failed'
  duration: string
}

export interface DeployPipelineFrame {
  activeStep: number
  steps: DeployPipelineStepState[]
  lines: boolean[]
  durationMs: number
  isError?: boolean
}

export interface DeployFlow {
  id: string
  title: string
  branch: string
  commit: string
  outcome: 'success' | 'error'
  steps: DeployPipelineStep[]
  cycle: DeployPipelineFrame[]
}

export type DeployFlowKey = 'production' | 'test_failed' | 'canary_rollback' | 'hotfix'

export const DEPLOY_FLOWS: Record<DeployFlowKey, DeployFlow> = {
  production: {
    id: 'production',
    title: 'Production Edge Release',
    branch: 'main',
    commit: 'e8a91c',
    outcome: 'success',
    steps: [
      {
        id: 1,
        title: 'Source Code Checkout',
        user: {
          name: 'Guillermo Rauch',
          avatar: 'https://avatars.spaceui.one/v1?name=guillermo&variant=all',
        },
        activeDescription: 'Fetching commit e8a91c and checking out origin/main branch...',
        completedDescription: 'Successfully fetched latest changes from the main branch.',
        description: 'Successfully fetched latest changes from the main branch.',
      },
      {
        id: 2,
        title: 'Dependency Installation',
        user: {
          name: 'Evan You',
          avatar: 'https://avatars.spaceui.one/v1?name=evan&variant=all',
        },
        activeDescription: 'Resolving packages and verifying checksums from lockfile...',
        completedDescription: 'All npm packages installed with Turbo cache hit.',
        description: 'All npm packages installed with Turbo cache hit.',
      },
      {
        id: 3,
        title: 'Unit & Integration Tests',
        user: {
          name: 'Dan Abramov',
          avatar: 'https://avatars.spaceui.one/v1?name=dan&variant=all',
        },
        activeDescription: 'Running 142 test suites across the entire codebase...',
        completedDescription: '142 test suites passed with 0 failures.',
        description: '142 test suites passed with 0 failures.',
      },
      {
        id: 4,
        title: 'Production Edge Build',
        user: {
          name: 'Lee Robinson',
          avatar: 'https://avatars.spaceui.one/v1?name=leerob&variant=all',
        },
        activeDescription: 'Optimizing assets and generating static site pages...',
        completedDescription: 'Production build generated and deployed to 32 edge regions.',
        description: 'Production build generated and deployed to 32 edge regions.',
      },
    ],
    cycle: [
      {
        activeStep: 1,
        durationMs: 2200,
        steps: [
          { status: 'active', duration: 'Running' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [false, false, false],
      },
      {
        activeStep: 1,
        durationMs: 700,
        steps: [
          { status: 'completed', duration: '12s' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, false, false],
      },
      {
        activeStep: 2,
        durationMs: 2400,
        steps: [
          { status: 'completed', duration: '12s' },
          { status: 'active', duration: 'Running' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, false, false],
      },
      {
        activeStep: 2,
        durationMs: 700,
        steps: [
          { status: 'completed', duration: '12s' },
          { status: 'completed', duration: '1m 45s' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, true, false],
      },
      {
        activeStep: 3,
        durationMs: 2800,
        steps: [
          { status: 'completed', duration: '12s' },
          { status: 'completed', duration: '1m 45s' },
          { status: 'active', duration: 'Running' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, true, false],
      },
      {
        activeStep: 3,
        durationMs: 700,
        steps: [
          { status: 'completed', duration: '12s' },
          { status: 'completed', duration: '1m 45s' },
          { status: 'completed', duration: '38s' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, true, true],
      },
      {
        activeStep: 4,
        durationMs: 2600,
        steps: [
          { status: 'completed', duration: '12s' },
          { status: 'completed', duration: '1m 45s' },
          { status: 'completed', duration: '38s' },
          { status: 'active', duration: 'Running' },
        ],
        lines: [true, true, true],
      },
      {
        activeStep: 4,
        durationMs: 3200,
        steps: [
          { status: 'completed', duration: '12s' },
          { status: 'completed', duration: '1m 45s' },
          { status: 'completed', duration: '38s' },
          { status: 'completed', duration: '2m 45s' },
        ],
        lines: [true, true, true],
      },
    ],
  },

  test_failed: {
    id: 'test_failed',
    title: 'Integration Test Regression',
    branch: 'feat/billing-stripe',
    commit: '4f1a09',
    outcome: 'error',
    steps: [
      {
        id: 1,
        title: 'Source Code Checkout',
        user: {
          name: 'Sophie Alpert',
          avatar: 'https://avatars.spaceui.one/v1?name=sophie&variant=all',
        },
        activeDescription: 'Fetching commit 4f1a09 and checking out feat/billing-stripe...',
        completedDescription: 'Source repository cloned cleanly at branch HEAD.',
        description: 'Source repository cloned cleanly at branch HEAD.',
      },
      {
        id: 2,
        title: 'Dependency Installation',
        user: {
          name: 'Mitchell Hashimoto',
          avatar: 'https://avatars.spaceui.one/v1?name=mitchell&variant=all',
        },
        activeDescription: 'Installing frozen lockfile and compiling native modules...',
        completedDescription: 'Workspace dependencies resolved in 8.4s.',
        description: 'Workspace dependencies resolved in 8.4s.',
      },
      {
        id: 3,
        title: 'Unit & Integration Tests',
        user: {
          name: 'Andrej Karpathy',
          avatar: 'https://avatars.spaceui.one/v1?name=andrej&variant=all',
        },
        activeDescription: 'Running 184 test suites across auth and billing engines...',
        errorDescription: 'AssertionError: expected status 200 but received 409 Conflict in billing-webhook.spec.ts:42',
        completedDescription: 'Test suites execution halted due to failure.',
        description: 'Running 184 test suites across auth and billing engines...',
        isError: true,
      },
      {
        id: 4,
        title: 'Production Release',
        user: {
          name: 'Kelsey Hightower',
          avatar: 'https://avatars.spaceui.one/v1?name=kelsey&variant=all',
        },
        activeDescription: 'Deployment skipped due to upstream test failures.',
        completedDescription: 'Pipeline execution halted. Production release aborted.',
        description: 'Release gate aborted automatically.',
      },
    ],
    cycle: [
      {
        activeStep: 1,
        durationMs: 2000,
        steps: [
          { status: 'active', duration: 'Running' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [false, false, false],
      },
      {
        activeStep: 1,
        durationMs: 600,
        steps: [
          { status: 'completed', duration: '14s' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, false, false],
      },
      {
        activeStep: 2,
        durationMs: 2200,
        steps: [
          { status: 'completed', duration: '14s' },
          { status: 'active', duration: 'Running' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, false, false],
      },
      {
        activeStep: 2,
        durationMs: 600,
        steps: [
          { status: 'completed', duration: '14s' },
          { status: 'completed', duration: '42s' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, true, false],
      },
      {
        activeStep: 3,
        durationMs: 2400,
        steps: [
          { status: 'completed', duration: '14s' },
          { status: 'completed', duration: '42s' },
          { status: 'active', duration: 'Running' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, true, false],
      },
      {
        activeStep: 3,
        durationMs: 3400,
        isError: true,
        steps: [
          { status: 'completed', duration: '14s' },
          { status: 'completed', duration: '42s' },
          { status: 'failed', duration: 'Failed' },
          { status: 'pending', duration: 'Aborted' },
        ],
        lines: [true, true, false],
      },
    ],
  },

  canary_rollback: {
    id: 'canary_rollback',
    title: 'Canary Health Probe & Rollback',
    branch: 'release/v3.4.0',
    commit: '9b2c81',
    outcome: 'error',
    steps: [
      {
        id: 1,
        title: 'Container Image Build',
        user: {
          name: 'Linus Torvalds',
          avatar: 'https://avatars.spaceui.one/v1?name=linus&variant=all',
        },
        activeDescription: 'Building multi-arch OCI container images (amd64/arm64)...',
        completedDescription: 'Images pushed and cryptographic digest verified.',
        description: 'Building multi-arch OCI container images.',
      },
      {
        id: 2,
        title: 'Staging Smoke Tests',
        user: {
          name: 'Rich Harris',
          avatar: 'https://avatars.spaceui.one/v1?name=rich&variant=all',
        },
        activeDescription: 'Executing end-to-end smoke tests on staging cluster...',
        completedDescription: 'Staging smoke tests passed with sub-50ms latency.',
        description: 'Executing end-to-end smoke tests on staging cluster.',
      },
      {
        id: 3,
        title: 'Canary 10% Traffic Rollout',
        user: {
          name: 'Kelsey Hightower',
          avatar: 'https://avatars.spaceui.one/v1?name=kelsey&variant=all',
        },
        activeDescription: 'Shifting 10% of ingress production traffic to canary pods...',
        completedDescription: 'Canary ingress live. Traffic routing established.',
        description: 'Shifting 10% of ingress production traffic to canary pods.',
      },
      {
        id: 4,
        title: 'Health & Latency Probe',
        user: {
          name: 'John Carmack',
          avatar: 'https://avatars.spaceui.one/v1?name=carmack&variant=all',
        },
        activeDescription: 'Monitoring telemetry metrics and p99 error rates...',
        errorDescription:
          'Fatal: HTTP 500 error rate spiked to 3.4% (threshold 0.5%). Automated rollback triggered in 4s.',
        completedDescription: 'Rollback completed. Ingress restored to stable v3.3.9.',
        description: 'Monitoring telemetry metrics and p99 error rates.',
        isError: true,
      },
    ],
    cycle: [
      {
        activeStep: 1,
        durationMs: 2000,
        steps: [
          { status: 'active', duration: 'Running' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [false, false, false],
      },
      {
        activeStep: 1,
        durationMs: 600,
        steps: [
          { status: 'completed', duration: '48s' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, false, false],
      },
      {
        activeStep: 2,
        durationMs: 2200,
        steps: [
          { status: 'completed', duration: '48s' },
          { status: 'active', duration: 'Running' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, false, false],
      },
      {
        activeStep: 2,
        durationMs: 600,
        steps: [
          { status: 'completed', duration: '48s' },
          { status: 'completed', duration: '24s' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, true, false],
      },
      {
        activeStep: 3,
        durationMs: 2400,
        steps: [
          { status: 'completed', duration: '48s' },
          { status: 'completed', duration: '24s' },
          { status: 'active', duration: 'Running' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, true, false],
      },
      {
        activeStep: 3,
        durationMs: 600,
        steps: [
          { status: 'completed', duration: '48s' },
          { status: 'completed', duration: '24s' },
          { status: 'completed', duration: '1m 12s' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, true, true],
      },
      {
        activeStep: 4,
        durationMs: 2600,
        steps: [
          { status: 'completed', duration: '48s' },
          { status: 'completed', duration: '24s' },
          { status: 'completed', duration: '1m 12s' },
          { status: 'active', duration: 'Running' },
        ],
        lines: [true, true, true],
      },
      {
        activeStep: 4,
        durationMs: 3400,
        isError: true,
        steps: [
          { status: 'completed', duration: '48s' },
          { status: 'completed', duration: '24s' },
          { status: 'completed', duration: '1m 12s' },
          { status: 'failed', duration: 'Rollback' },
        ],
        lines: [true, true, true],
      },
    ],
  },

  hotfix: {
    id: 'hotfix',
    title: 'Security Zero-Downtime Patch',
    branch: 'hotfix/cve-cors',
    commit: '7a13d5',
    outcome: 'success',
    steps: [
      {
        id: 1,
        title: 'Fast Checkout & AST Lint',
        user: {
          name: 'Poteto',
          avatar: 'https://avatars.spaceui.one/v1?name=poteto&variant=all',
        },
        activeDescription: 'Scanning AST tree and verifying strict type safety...',
        completedDescription: 'AST audit clean. 0 syntax anomalies detected.',
        description: 'AST audit clean. 0 syntax anomalies detected.',
      },
      {
        id: 2,
        title: 'Security Vulnerability Scan',
        user: {
          name: 'Theo Browne',
          avatar: 'https://avatars.spaceui.one/v1?name=theo&variant=all',
        },
        activeDescription: 'Running Trivy static vulnerability audit on packages...',
        completedDescription: '0 critical CVE vulnerabilities found.',
        description: '0 critical CVE vulnerabilities found.',
      },
      {
        id: 3,
        title: 'Edge Binary Compilation',
        user: {
          name: 'Addy Osmani',
          avatar: 'https://avatars.spaceui.one/v1?name=addy&variant=all',
        },
        activeDescription: 'Compiling optimized WebAssembly & edge distribution artifacts...',
        completedDescription: 'Edge binaries compiled with 34% smaller bundle footprint.',
        description: 'Edge binaries compiled with 34% smaller bundle footprint.',
      },
      {
        id: 4,
        title: 'Rolling Kubernetes Swap',
        user: {
          name: 'Seb Markbåge',
          avatar: 'https://avatars.spaceui.one/v1?name=seb&variant=all',
        },
        activeDescription: 'Performing rolling pod swap with zero dropped connections...',
        completedDescription: 'Hotfix deployed live across all production clusters.',
        description: 'Hotfix deployed live across all production clusters.',
      },
    ],
    cycle: [
      {
        activeStep: 1,
        durationMs: 1800,
        steps: [
          { status: 'active', duration: 'Running' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [false, false, false],
      },
      {
        activeStep: 1,
        durationMs: 600,
        steps: [
          { status: 'completed', duration: '4s' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, false, false],
      },
      {
        activeStep: 2,
        durationMs: 2000,
        steps: [
          { status: 'completed', duration: '4s' },
          { status: 'active', duration: 'Running' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, false, false],
      },
      {
        activeStep: 2,
        durationMs: 600,
        steps: [
          { status: 'completed', duration: '4s' },
          { status: 'completed', duration: '16s' },
          { status: 'pending', duration: 'Pending' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, true, false],
      },
      {
        activeStep: 3,
        durationMs: 2200,
        steps: [
          { status: 'completed', duration: '4s' },
          { status: 'completed', duration: '16s' },
          { status: 'active', duration: 'Running' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, true, false],
      },
      {
        activeStep: 3,
        durationMs: 600,
        steps: [
          { status: 'completed', duration: '4s' },
          { status: 'completed', duration: '16s' },
          { status: 'completed', duration: '28s' },
          { status: 'pending', duration: 'Pending' },
        ],
        lines: [true, true, true],
      },
      {
        activeStep: 4,
        durationMs: 2200,
        steps: [
          { status: 'completed', duration: '4s' },
          { status: 'completed', duration: '16s' },
          { status: 'completed', duration: '28s' },
          { status: 'active', duration: 'Running' },
        ],
        lines: [true, true, true],
      },
      {
        activeStep: 4,
        durationMs: 3000,
        steps: [
          { status: 'completed', duration: '4s' },
          { status: 'completed', duration: '16s' },
          { status: 'completed', duration: '28s' },
          { status: 'completed', duration: '52s' },
        ],
        lines: [true, true, true],
      },
    ],
  },
}
