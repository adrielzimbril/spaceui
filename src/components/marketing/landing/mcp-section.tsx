'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowUpRight, Check, Copy, Bot } from 'lucide-react'
import { Frame, FrameHeader, FrameTitle, FrameDescription, FrameFooter } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Button } from '@/registry/primitives/button'
import { bloomSound, tickSound } from '@/components/providers/sound-provider'
import { cn } from '@/registry/lib/utils'

const MCP_CONFIGS = [
  {
    id: 'claude',
    label: 'Claude Desktop',
    filename: 'claude_desktop_config.json',
    code: `{
  "mcpServers": {
    "spaceui": {
      "command": "npx",
      "args": ["-y", "@spaceui/mcp@latest"]
    }
  }
}`,
  },
  {
    id: 'cursor',
    label: 'Cursor IDE',
    filename: '.cursor/mcp.json',
    code: `{
  "mcpServers": {
    "spaceui": {
      "command": "npx",
      "args": ["-y", "@spaceui/mcp@latest"]
    }
  }
}`,
  },
  {
    id: 'antigravity',
    label: 'Antigravity / Gemini',
    filename: 'antigravity.mcp.json',
    code: `{
  "mcpServers": {
    "spaceui": {
      "command": "npx",
      "args": ["-y", "@spaceui/mcp@latest"]
    }
  }
}`,
  },
]

export function McpSection() {
  const [activeTab, setActiveTab] = React.useState('claude')
  const [copied, setCopied] = React.useState(false)

  const currentConfig = MCP_CONFIGS.find((c) => c.id === activeTab) ?? MCP_CONFIGS[0]

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentConfig.code)
    bloomSound()
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section id="mcp" data-page-section className="mx-auto max-w-[1280px] scroll-mt-16 px-5 sm:px-6 py-20">
      <div className="rounded-3xl bg-secondary/40 p-8 sm:p-12 md:p-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Left Column: Value Prop */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Bot className="size-3.5 text-foreground" />
              <span>Model Context Protocol · Agent Ready</span>
            </div>

            <h2 className="mt-4 text-[32px] font-semibold tracking-tight leading-[1.08] text-foreground sm:text-[44px] md:text-[50px]">
              Built for your hands.
              <br />
              <span className="text-muted-foreground">Documented for your AI.</span>
            </h2>

            <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-muted-foreground">
              Coding with AI shouldn&apos;t mean dealing with invented props and broken styles. Space UI publishes
              strict component schemas, AST registries, and an official MCP server.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                'Native support for Claude Desktop, Cursor, Claude Code, and Antigravity',
                'Zero hallucination: agents pull exact props, dependencies, and styles',
                'Instant code generation matching your project Tailwind configuration',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-foreground/90">
                  <Check className="mt-0.5 size-4 shrink-0 text-foreground" strokeWidth={2.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/docs/ai/mcp"
                data-space-hover
                data-space-click="confirm"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-95"
              >
                <span>Read MCP Documentation</span>
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Code Card using demo-p-card-10 pattern (Frame + Card) */}
          <Frame>
            <FrameHeader className="flex flex-row items-center justify-between p-2">
              <div>
                <FrameTitle>Configuration</FrameTitle>
                <FrameDescription>// {currentConfig.filename}</FrameDescription>
              </div>
              <Button variant="secondary" size="xs" onClick={handleCopy} data-space-hover className="cursor-pointer">
                {copied ? (
                  <>
                    <Check className="size-3 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy config</span>
                  </>
                )}
              </Button>
            </FrameHeader>

            <Card>
              <CardPanel className="flex flex-col gap-3">
                {/* Client Selector Tabs */}
                <div className="flex items-center gap-1">
                  {MCP_CONFIGS.map((client) => (
                    <Button
                      key={client.id}
                      variant={activeTab === client.id ? 'default' : 'ghost'}
                      size="xs"
                      onClick={() => {
                        tickSound()
                        setActiveTab(client.id)
                      }}
                      className={cn(
                        'cursor-pointer',
                        activeTab === client.id
                          ? 'bg-foreground text-background font-semibold'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {client.label}
                    </Button>
                  ))}
                </div>

                {/* Code editor view */}
                <pre className="overflow-x-auto rounded-xl bg-muted/40 p-4 text-xs leading-relaxed text-foreground">
                  <code>{currentConfig.code}</code>
                </pre>
              </CardPanel>
            </Card>

            <FrameFooter>
              <div className="flex flex-col items-start gap-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>Verified Schema Registry via @spaceui/mcp</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Prompt: &ldquo;Add an audio-reactive OrbBloop and generative avatars to my hero section.&rdquo;
                </p>
              </div>
            </FrameFooter>
          </Frame>
        </div>
      </div>
    </section>
  )
}
