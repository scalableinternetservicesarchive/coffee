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

export const fetchLikedCafes = gql`
  query GetLikedCafes {
    getLikedCafes{
      id
      name
      latitude
      longitude
    }
  }
  
`

export const fetchNearbyCafes= gql`
  query FetchNearbyCafes($lat: Float!, $long: Float!, $numResults: Int) {
    getNearbyCafes(lat: $lat, long: $long, numResults: $numResults) {
      id
      name
      latitude
      longitude
    }
  }
`
export const fetchTopTenCafesNearMe = gql`
  query GetTopTenCafesNearMe($lat: Float!, $long: Float!) {
    getTopTenCafes(lat: $lat, long: $long){
      id
      name
      totalLikes
      latitude
      longitude
    }
  }
`

export const fetchAllLikes = gql`
  query FetchAllLikes {
    allLikes {
      cafe {
        id
        name
      }
      user {
        id
        firstName
      }
    }
  }
`
