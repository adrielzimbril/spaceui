import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from 'fumadocs-mdx/config'
import { z } from 'zod'

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.vercel.app/docs/mdx/collections#define-docs
const previewOptionsSchema = z.object({
  name: z.string(),
  iframe: z.boolean().optional(),
  bigScreen: z.boolean().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  variant: z.enum(['default', 'showcase', 'card']).optional(),
  restart: z.boolean().optional(),
  open: z.boolean().optional(),
  allowCopy: z.boolean().optional(),
  contained: z.boolean().optional(),
  container: z.boolean().optional(),
  align: z.enum(['start', 'center', 'end']).optional(),
  className: z.string().optional(),
  externalUrl: z.string().optional(),
  showcase: z.boolean().optional(),
})

const sharedSchema = {
  schema: frontmatterSchema.extend({
    releaseDate: z.coerce.date().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    status: z.enum(['coming-soon', 'beta', 'new', 'updated']).optional(),
    icon: z.string().optional(),
    beta: z.boolean().optional(),
    alpha: z.boolean().optional(),
    updated: z.boolean().optional(),
    deprecated: z.boolean().optional(),
    author: z
      .object({
        name: z.string(),
        url: z.string().optional(),
      })
      .optional(),
    mode: z.enum(['both', 'standard', 'split']).optional().default('both'),
    defaultMode: z.enum(['standard', 'split']).optional(),
    preview: z.union([z.string(), previewOptionsSchema]).optional(),
  }),
}

export const docs = defineDocs({
  dir: 'src/content/docs',
  docs: sharedSchema,
  meta: {
    schema: metaSchema,
  },
})

export const library = defineDocs({
  dir: 'src/content/library',
  docs: sharedSchema,
  meta: {
    schema: metaSchema,
  },
})

export const resources = defineDocs({
  dir: 'src/content/resources',
  docs: sharedSchema,
  meta: {
    schema: metaSchema,
  },
})

export default defineConfig({
  mdxOptions: {},
})
