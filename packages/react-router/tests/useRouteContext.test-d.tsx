import { expectTypeOf, test } from 'vitest'
import {
  createRootRoute,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  useRouteContext,
} from '../src'
import type { FullSearchSchema } from '../src'

test('when there is no context', () => {
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

  expectTypeOf(useRouteContext<DefaultRouter['routeTree']>)
    .parameter(0)
    .toHaveProperty('from')
    .toEqualTypeOf<'/invoices' | '__root__' | '/invoices/' | '/'>()

  expectTypeOf(useRouteContext<DefaultRouter['routeTree']>)
    .parameter(0)
    .toHaveProperty('strict')
    .toEqualTypeOf<true | undefined>()

  expectTypeOf(useRouteContext<DefaultRouter['routeTree'], '/'>)
    .parameter(0)
    .toHaveProperty('select')
    .parameter(0)
    .toEqualTypeOf<{}>()

  expectTypeOf(useRouteContext<DefaultRouter['routeTree'], '/'>)
    .parameter(0)
    .toHaveProperty('select')
    .returns.toEqualTypeOf<{}>()

  expectTypeOf(
    useRouteContext<DefaultRouter['routeTree'], '/'>,
  ).returns.toEqualTypeOf<{}>()

  expectTypeOf(
    useRouteContext<DefaultRouter['routeTree'], '/', false>({ strict: false }),
  ).toEqualTypeOf<{}>()
})

test('when there is the root context', () => {
  interface Context {
    userId: string
  }

  const rootRoute = createRootRouteWithContext<Context>()()

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
    context: { userId: 'userId' },
  })

  type DefaultRouter = typeof defaultRouter

  expectTypeOf(
    useRouteContext<DefaultRouter['routeTree'], '/'>,
  ).returns.toEqualTypeOf<{ userId: string }>()

  expectTypeOf(
    useRouteContext<DefaultRouter['routeTree'], '/invoices/$invoiceId'>,
  ).returns.toEqualTypeOf<{ userId: string }>()

  expectTypeOf(
    useRouteContext<DefaultRouter['routeTree'], '/invoices/$invoiceId'>,
  )
    .parameter(0)
    .toHaveProperty('select')
    .toEqualTypeOf<
      ((search: { userId: string }) => { userId: string }) | undefined
    >()

  expectTypeOf(
    useRouteContext<DefaultRouter['routeTree'], '/invoices', false>,
  ).returns.toEqualTypeOf<{ userId?: string }>()

  expectTypeOf(useRouteContext<DefaultRouter['routeTree'], '/invoices', false>)
    .parameter(0)
    .toHaveProperty('select')
    .toEqualTypeOf<
      ((search: { userId?: string }) => { userId?: string }) | undefined
    >()

  expectTypeOf(
    useRouteContext<
      DefaultRouter['routeTree'],
      '/invoices',
      false,
      FullSearchSchema<DefaultRouter['routeTree']>,
      number
    >,
  ).returns.toEqualTypeOf<number>()
})

test('when there are multiple contexts', () => {
  interface Context {
    userId: string
  }

  const rootRoute = createRootRouteWithContext<Context>()()

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
    beforeLoad: () => ({ username: 'username' }),
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
    context: { userId: 'userId' },
  })

  type DefaultRouter = typeof defaultRouter

  expectTypeOf(
    useRouteContext<DefaultRouter['routeTree'], '/'>,
  ).returns.toEqualTypeOf<{ userId: string }>()

  expectTypeOf(
    useRouteContext<DefaultRouter['routeTree'], '/invoices/$invoiceId'>,
  ).returns.toEqualTypeOf<{ userId: string }>()

  expectTypeOf(
    useRouteContext<DefaultRouter['routeTree'], '/invoices/$invoiceId'>,
  )
    .parameter(0)
    .toHaveProperty('select')
    .toEqualTypeOf<
      ((search: { userId: string }) => { userId: string }) | undefined
    >()

  expectTypeOf(
    useRouteContext<DefaultRouter['routeTree'], '/invoices', false>,
  ).returns.toEqualTypeOf<{ userId?: string; username?: string }>()

  expectTypeOf(useRouteContext<DefaultRouter['routeTree'], '/invoices', false>)
    .parameter(0)
    .toHaveProperty('select')
    .toEqualTypeOf<
      | ((search: { userId?: string; username?: string }) => {
          userId?: string
          username?: string
        })
      | undefined
    >()
})

test('when there are overlapping contexts', () => {
  interface Context {
    userId: string
  }

  const rootRoute = createRootRouteWithContext<Context>()()

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
  })

  const invoicesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'invoices',
    validateSearch: () => ({ page: 0 }),
  })

  const invoicesIndexRoute = createRoute({
    getParentRoute: () => invoicesRoute,
    path: '/',
  })

  const invoiceRoute = createRoute({
    getParentRoute: () => invoicesRoute,
    path: '$invoiceId',
    beforeLoad: () => ({ username: 'username2' }) as const,
  })

  const postsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'posts',
  })

  const postRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: '$postId',
    beforeLoad: () => ({ username: 'username1' }) as const,
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
    context: { userId: 'userId' },
  })

  type DefaultRouter = typeof defaultRouter

  expectTypeOf(useRouteContext<DefaultRouter['routeTree'], '/'>).returns
    .toEqualTypeOf<{ userId: string }>

  expectTypeOf(
    useRouteContext<DefaultRouter['routeTree'], '/invoices/$invoiceId'>,
  ).returns.toEqualTypeOf<{
    userId: string
    readonly username: 'username2'
  }>()

  expectTypeOf(
    useRouteContext<DefaultRouter['routeTree'], '/invoices/$invoiceId'>,
  )
    .parameter(0)
    .toHaveProperty('select')
    .toEqualTypeOf<
      | ((search: { userId: string; readonly username: 'username2' }) => {
          userId: string
          readonly username: 'username2'
        })
      | undefined
    >()

  expectTypeOf(
    useRouteContext<DefaultRouter['routeTree'], '/invoices', false>,
  ).returns.toEqualTypeOf<{
    userId?: string
    username?: 'username1' | 'username2'
  }>()

  expectTypeOf(useRouteContext<DefaultRouter['routeTree'], '/invoices', false>)
    .parameter(0)
    .toHaveProperty('select')
    .toEqualTypeOf<
      | ((search: {
          userId?: string
          username?: 'username2' | 'username1'
        }) => {
          userId?: string
          username?: 'username2' | 'username1'
        })
      | undefined
    >()
})
