import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'

import config from '@/payload.config'
import '../styles.css'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Args = {
  params: Promise<{
    slug?: string[]
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { slug: pathSegments } = await paramsPromise

  const isHome = typeof pathSegments === 'undefined' || !pathSegments.length
  const pageUrl = isHome ? '/' : `/${pathSegments.join('/')}`
  const pageSlug = isHome ? 'home' : pathSegments[pathSegments.length - 1]

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const {
    docs: [page],
  } = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    where: isHome
      ? {
          slug: {
            equals: 'home',
          },
        }
      : {
          and: [
            {
              'breadcrumbs.url': {
                equals: pageUrl,
              },
            },
            {
              slug: {
                equals: pageSlug,
              },
            },
          ],
        },
  })

  if (!page) {
    return notFound()
  }

  const { docs: childPages } = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    where: {
      parent: {
        equals: page.id,
      },
    },
  })

  const isRoot = isHome || typeof page.parent === 'undefined'
  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <div className="home">
      <div className="content">
        <h1>{page.title}</h1>

        <nav className="nav-links">
          <p>Root pages</p>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
          </ul>
        </nav>

        {!isRoot ? (
          <nav className="nav-links">
            <p>Parent pages</p>
            <ul>
              {page.breadcrumbs
                ?.filter(({ url }) => url !== `/${pathSegments?.join('/')}`)
                .map(({ label, url }) => (
                  <li key={label}>
                    <Link href={url as string}>{label}</Link>
                  </li>
                ))}
            </ul>
          </nav>
        ) : null}

        {childPages.length ? (
          <nav className="nav-links">
            <p>Nested pages</p>
            <ul>
              {childPages?.map(({ breadcrumbs }) => {
                if (!breadcrumbs?.length) {
                  return null
                }

                const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1]

                return (
                  <li key={lastBreadcrumb.url}>
                    <Link href={lastBreadcrumb.url as string}>{lastBreadcrumb.label}</Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        ) : null}
      </div>

      <div className="footer">
        <p>Update this page by editing</p>
        <a className="codeLink" href={fileURL}>
          <code>app/(frontend)/[[...slug]]/page.tsx</code>
        </a>
      </div>
    </div>
  )
}
