// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { seed } from './seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Pages, Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  onInit: async (payload) => {
    const { totalDocs } = await payload.count({ collection: 'pages' })
    if (!totalDocs) {
      await seed(payload)
    }
  },
  sharp,
  plugins: [
    nestedDocsPlugin({
      collections: ['pages'],
      generateLabel: (_, doc) => doc.title as string,
      generateURL: (docs) =>
        docs.reduce(
          (url, doc) => (doc.slug === 'home' ? '/' : `${url === '/' ? '' : url}/${doc.slug}`),
          '',
        ),
    }),
  ],
})
