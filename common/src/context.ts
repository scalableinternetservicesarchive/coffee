interface AppContext {
  serverRendered?: boolean
  commitHash?: string
  isProd?: boolean
  wsUrl?: string

  /**
   * Apollo cache (state) from GraphQL request made during server-side rendering.
   *
   * Used or client-side cache hydration.
   */
  apolloState?: any

  // For debugging
  apolloLink?: any
  apolloCache?: any
  apolloClient?: any
}

export function appContext(): AppContext {
  if (typeof window !== 'undefined') {
    return (window as any).app || {}
  }

  return {} as AppContext
}
