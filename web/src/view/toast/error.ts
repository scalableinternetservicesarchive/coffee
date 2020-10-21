import { ApolloError } from '@apollo/client'
import { GraphQLError } from 'graphql'
import { toastErr } from './toast'

function summarizeError(errs: readonly GraphQLError[]): string {
  if (errs == null || errs.length === 0) {
    return ''
  }
  return errs.map(err => err.message).join(', ')
}

export function handleError(err: ApolloError): any {
  const { message, graphQLErrors, networkError, extraInfo } = err
  console.error({ message, graphQLErrors, networkError, extraInfo })
  const errMsg = summarizeError(graphQLErrors) || message
  toastErr(errMsg)
}
