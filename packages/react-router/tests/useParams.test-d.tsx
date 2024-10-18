import { expectTypeOf, test } from 'vitest'
import { createRootRoute, createRoute, createRouter, useParams } from '../src'
import type { FullSearchSchema } from '../src'

test('when there are no params', () => {
  const rootRoute = createRootRoute()

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
  })

  const invoicesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'invoices',
  })

  const invoicesIndexRoute = createRoute({
    getParentRoute: () => invoicesRoute,
    path: '/',
  })

  const routeTree = rootRoute.addChildren([
    invoicesRoute.addChildren([invoicesIndexRoute]),
    indexRoute,
  ])

  const defaultRouter = createRouter({
    routeTree,
  })

  type DefaultRouter = typeof defaultRouter

  expectTypeOf(useParams<DefaultRouter['routeTree']>)
    .parameter(0)
    .toHaveProperty('from')
    .toEqualTypeOf<'/invoices' | '__root__' | '/invoices/' | '/'>()

  expectTypeOf(useParams<DefaultRouter['routeTree']>)
    .parameter(0)
    .toHaveProperty('strict')
    .toEqualTypeOf<true | undefined>()

  expectTypeOf(useParams<DefaultRouter['routeTree'], '/'>)
    .parameter(0)
    .toHaveProperty('select')
    .parameter(0)
    .toEqualTypeOf<{}>()

  expectTypeOf(useParams<DefaultRouter['routeTree'], '/'>)
    .parameter(0)
    .toHaveProperty('select')
    .returns.toEqualTypeOf<{}>()

  expectTypeOf(
    useParams<DefaultRouter['routeTree'], '/'>,
  ).returns.toEqualTypeOf<{}>()

  expectTypeOf(
    useParams<DefaultRouter['routeTree'], '/', false>({ strict: false }),
  ).toEqualTypeOf<{}>()
})

test('when there is one param', () => {
  const rootRoute = createRootRoute()

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
  })

  const invoicesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'invoices',
  })

  const invoicesIndexRoute = createRoute({
    getParentRoute: () => invoicesRoute,
    path: '/',
  })

  const invoiceRoute = createRoute({
    getParentRoute: () => invoicesRoute,
    path: '$invoiceId',
  })

  const routeTree = rootRoute.addChildren([
    invoicesRoute.addChildren([invoicesIndexRoute, invoiceRoute]),
    indexRoute,
  ])

  const defaultRouter = createRouter({
    routeTree,
  })

  type DefaultRouter = typeof defaultRouter

  expectTypeOf(
    useParams<DefaultRouter['routeTree'], '/'>,
  ).returns.toEqualTypeOf<{}>()

  expectTypeOf(
    useParams<DefaultRouter['routeTree'], '/invoices/$invoiceId'>,
  ).returns.toEqualTypeOf<{ invoiceId: string }>()

  expectTypeOf(useParams<DefaultRouter['routeTree'], '/invoices/$invoiceId'>)
    .parameter(0)
    .toHaveProperty('select')
    .toEqualTypeOf<
      ((search: { invoiceId: string }) => { invoiceId: string }) | undefined
    >()

  expectTypeOf(
    useParams<DefaultRouter['routeTree'], '/invoices', false>,
  ).returns.toEqualTypeOf<{ invoiceId?: string }>()

  expectTypeOf(useParams<DefaultRouter['routeTree'], '/invoices', false>)
    .parameter(0)
    .toHaveProperty('select')
    .toEqualTypeOf<
      ((search: { invoiceId?: string }) => { invoiceId?: string }) | undefined
    >()

  expectTypeOf(
    useParams<
      DefaultRouter['routeTree'],
      '/invoices',
      false,
      FullSearchSchema<DefaultRouter['routeTree']>,
      number
    >,
  ).returns.toEqualTypeOf<number>()
})

test('when there are multiple params', () => {
  const rootRoute = createRootRoute()

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
  })

  const invoicesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'invoices',
  })

  const invoicesIndexRoute = createRoute({
    getParentRoute: () => invoicesRoute,
    path: '/',
  })

  const invoiceRoute = createRoute({
    getParentRoute: () => invoicesRoute,
    path: '$invoiceId',
  })

  const postsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'posts',
  })

  const postRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: '$postId',
  })

  const routeTree = rootRoute.addChildren([
    invoicesRoute.addChildren([
      invoicesIndexRoute,
      invoiceRoute,
      postsRoute.addChildren([postRoute]),
    ]),
    indexRoute,
  ])

  const defaultRouter = createRouter({
    routeTree,
  })

  type DefaultRouter = typeof defaultRouter

  expectTypeOf(
    useParams<DefaultRouter['routeTree'], '/'>,
  ).returns.toEqualTypeOf<{}>()

  expectTypeOf(
    useParams<DefaultRouter['routeTree'], '/invoices/$invoiceId'>,
  ).returns.toEqualTypeOf<{ invoiceId: string }>()

  expectTypeOf(useParams<DefaultRouter['routeTree'], '/invoices/$invoiceId'>)
    .parameter(0)
    .toHaveProperty('select')
    .toEqualTypeOf<
      ((search: { invoiceId: string }) => { invoiceId: string }) | undefined
    >()

  expectTypeOf(
    useParams<DefaultRouter['routeTree'], '/invoices', false>,
  ).returns.toEqualTypeOf<{ invoiceId?: string; postId?: string }>()

  expectTypeOf(useParams<DefaultRouter['routeTree'], '/invoices', false>)
    .parameter(0)
    .toHaveProperty('select')
    .toEqualTypeOf<
      | ((search: { invoiceId?: string; postId?: string }) => {
          invoiceId?: string
          postId?: string
        })
      | undefined
    >()
})
