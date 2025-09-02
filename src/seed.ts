import { Payload, PayloadRequest } from 'payload'

export async function seed(payload: Payload) {
  const req = { payload } as PayloadRequest

  const home = await payload.create({
    collection: 'pages',
    data: {
      title: 'Home',
      slug: 'home',
    },
    req,
  })

  const child = await payload.create({
    collection: 'pages',
    data: {
      title: 'Child',
      slug: 'child',
      parent: home.id,
    },
    req,
  })

  await payload.create({
    collection: 'pages',
    data: {
      title: 'Grandchild',
      slug: 'grandchild',
      parent: child.id,
    },
    req,
  })

  const about = await payload.create({
    collection: 'pages',
    data: {
      title: 'About',
      slug: 'about',
    },
    req,
  })

  await payload.create({
    collection: 'pages',
    data: {
      title: 'Our team',
      slug: 'our-team',
      parent: about.id,
    },
    req,
  })
}
