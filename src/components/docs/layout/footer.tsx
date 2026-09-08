import { Link } from '@/registry/primitives/link'
import { siteConfig } from '@/config/space-config'

export function Footer() {
  return (
    <div className="mt-8 mb-6 not-prose w-full scroll-m-24 border-t border-border/40 pt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-foreground tracking-tight">Keep in mind</h2>
      </div>
      <div className="flex flex-col gap-2 px-1">
        <ul className="list-disc space-y-2.5 pl-5 text-sm text-muted-foreground leading-relaxed">
          <li>
            <strong className="text-foreground font-medium">MIT License:</strong> Free and open-source for personal and
            commercial use. Feel free to copy, tweak, and adapt the components to match your exact needs.
          </li>
          <li>
            <strong className="text-foreground font-medium">Credits & Inspiration:</strong> Some components on this site
            are inspired by or recreated from great ideas across the web. I&apos;m not here to take credit; just to
            learn, experiment, and push interface craft further.
          </li>
          <li>
            <strong className="text-foreground font-medium">Reach out & Claims:</strong> If an attribution was missed,
            or if you have any inquiry or claim, feel free to reach out directly on X to{' '}
            <Link
              href={siteConfig.author.twitter}
              target="_blank"
              rel="noopener noreferrer"
              underline
              variant="ghost"
              className="text-foreground hover:text-primary font-medium p-0 h-auto inline"
            >
              {siteConfig.author.twitterHandle}
            </Link>
            . I&apos;ll be glad to update or resolve it right away.
          </li>
        </ul>
      </div>
    </div>
  )
}
