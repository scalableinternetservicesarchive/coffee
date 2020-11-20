import { gql } from '@apollo/client'
import { getApolloClient } from '../../graphql/apolloClient'
import { AddCafe, AddCafeVariables, AddLike, AddLikeVariables } from '../../graphql/query.gen'

const addCafeMutation = gql`
  mutation AddCafe($name: String!, $long: Float!, $lat: Float!) {
    addCafe(name: $name, long: $long, lat: $lat) {
      id
    }
  }
`

const addLikeMutation = gql`
  mutation AddLike($cafeId: Int!) {
    addLike(cafeId: $cafeId) {
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

export function addLike(cafeId: number) {
  return getApolloClient().mutate<AddLike, AddLikeVariables>({
    mutation: addLikeMutation,
    variables: { cafeId },
  })
}
