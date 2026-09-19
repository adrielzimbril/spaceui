import { BouncyAccordion } from '@/registry/components/spaceui/bouncy-accordion'
import { siteConfig } from '@/config/space-config'
import { SectionHeader } from './section-header'

const faqs = [
  {
    question: 'What is the difference between Pro Yearly and Lifetime?',
    answer:
      'Pro Yearly gives you full access to every component, block, and template for one year, billed once a year. Lifetime is a single one-time payment that unlocks everything forever, including all future updates, with no renewal.',
  },
  {
    question: 'Can I upgrade from Pro Yearly to Lifetime later?',
    answer:
      'Yes. Reach out at ' +
      siteConfig.email +
      ' and we will credit your current subscription toward a Lifetime license.',
  },
  {
    question: 'Can I use Space UI in commercial and client projects?',
    answer: 'Yes. Every paid plan, including the fixed-price templates, includes a commercial usage license.',
  },
  {
    question: 'How do I install components, and do I own the code?',
    answer:
      'Components are installed directly into your project via our CLI or copy-paste. There is no vendor lock-in or heavy runtime package — you own 100% of the code in your repository forever.',
  },
  {
    question: 'How do the AI Skills and MCP integration work?',
    answer:
      'You get plug-and-play agent rules, llms.txt context, and an MCP server that connect directly to Claude Code, Cursor, or VS Code. Your AI agents can discover, install, and customize Space UI components autonomously in your workspace.',
  },
  {
    question: 'How often are new components and shaders released?',
    answer:
      'We release new interactive components, GLSL shaders, blocks, and templates on a regular weekly basis. Both active Pro subscribers and Lifetime members get instant access to every new drop.',
  },
]

export function FaqSection() {
  return (
    <section data-page-section className="mx-auto max-w-7xl scroll-mt-16 px-5 sm:px-6 py-16">
      <SectionHeader badge="FAQ" title="Frequently asked questions" description="Still unsure? Here's the rundown." />

      <BouncyAccordion
        className="mx-auto mt-10 squircle w-full max-w-xl"
        defaultValue={0}
        items={faqs.map((faq) => ({ title: faq.question, description: faq.answer }))}
      />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Still have questions? Email us at{' '}
        <a
          href={`mailto:${siteConfig.email}`}
          className="font-semibold text-foreground transition-colors hover:text-primary"
        >
          {siteConfig.email}
        </a>
      </p>
    </section>
  )
}
