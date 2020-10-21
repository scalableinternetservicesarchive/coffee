import { ApolloClient, InMemoryCache, NormalizedCacheObject, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { HttpLink } from '@apollo/client/link/http'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { appContext } from '../../../common/src/context'

let clientSingleton: ApolloClient<NormalizedCacheObject> | undefined = undefined

export function getApolloClient() {
  if (clientSingleton) {
    return clientSingleton
  }

  const appCtx = appContext()

  const isStorybook = Boolean(window.origin === 'http://localhost:6006')

  const httpLink = new HttpLink({
    uri: isStorybook ? 'http://localhost:3000/graphql' : '/graphql',
    credentials: 'same-origin',
    fetch: (uri: any, options: any) => {
      const reqBody = JSON.parse(options!.body! as string)
      const opName = reqBody.operationName
      const actionName = reqBody.variables?.action?.actionName
      return fetch(`${uri}?opName=${opName}${actionName ? `&actionName=${actionName}` : ''}`, options)
    },
  })

  const wsLink = new WebSocketLink({
    uri: appCtx.wsUrl || 'ws://localhost:3000/graphqlsubscription',
    options: {
      reconnect: true,
    },
  })

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    },
    wsLink,
    httpLink
  )

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
      )
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`)
    }
  })

  const authLink = setContext((_, { headers }) => {
    const headersWithAuth = Object.assign({}, headers, { 'X-CSRF': 'csrf' })
    return {
      headers: headersWithAuth,
    }
  })

  const link = authLink.concat(errorLink).concat(splitLink)

  const cache = new InMemoryCache()
  if (appCtx.apolloState) {
    cache.restore(appCtx.apolloState)
  }

  clientSingleton = new ApolloClient({ link: link as any, cache })

  appCtx.apolloLink = link
  appCtx.apolloCache = cache
  appCtx.apolloClient = clientSingleton

  return clientSingleton
}
