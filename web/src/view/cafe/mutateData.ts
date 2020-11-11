import { gql } from '@apollo/client'
import { getApolloClient } from '../../graphql/apolloClient'
import { AddCafe, AddCafeVariables } from '../../graphql/query.gen'

const addCafeMutation = gql`
  mutation AddCafe($name: String!, $long: Float!, $lat: Float!) {
    addCafe(name: $name, long: $long, lat: $lat) {
      id
    }
  }
`

export function addCafe(name: string, long: number, lat: number) {
  return getApolloClient().mutate<AddCafe, AddCafeVariables>({
    mutation: addCafeMutation,
    variables: { name, long, lat },
  })
}
