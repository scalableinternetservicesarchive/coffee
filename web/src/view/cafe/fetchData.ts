import { gql } from '@apollo/client'

export const fragmentCafe = gql`
  fragment Cafe on Cafe {
    id
    name
    longitude
    latitude
  }
`

export const fetchCafes = gql`
  query FetchCafes {
    cafes {
      ...Cafe
    }
  }
  ${fragmentCafe}
`

export const fetchLikes = gql`
  query FetchLikes($userId: Int!) {
    likes(userId: $userId) {
      cafe {
        ...Cafe
      }
    }
  }
  ${fragmentCafe}
`
