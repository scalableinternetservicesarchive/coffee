import { useQuery } from '@apollo/client'
import * as React from 'react'
import { GetTopTenCafesNearMe, GetTopTenCafesNearMe_getTopTenCafes } from '../../graphql/query.gen'
import { H3 } from '../../style/header'
import { BodyText } from '../../style/text'
import { fetchTopTenCafesNearMe } from './fetchData'
import { addLike } from './mutateData'

export function TopTenCafes () {
  const { loading, data } = useQuery<GetTopTenCafesNearMe>(fetchTopTenCafesNearMe, {
    variables: {
      // TODO: replace with GPS here. (improvement, not necessary though)
      lat: 34.06,
      long: -118.23
    }
  })

  // TODO: figure out handleLike in this top ten cafe thing
  function handleLike(cafeId: number) {
    addLike(cafeId)
      .then(id => {
        console.log(`like ${id} created`)
      })
      .catch(err => console.log(err))
  }

  if (loading) {
    return <div>loading...</div>
  }
  if (!data || data.getTopTenCafes.length === 0) {
    return <div>no cafes near you. Sorry :(</div>
  }
  return (
    <div>
      {data.getTopTenCafes.map((s: GetTopTenCafesNearMe_getTopTenCafes) => (
        <div key={s.id} style={{ margin: '10px 0' }}>
          <H3>
            {s.name} <span onClick={() => handleLike(s.id)}>♡</span>
          </H3>
          <BodyText>
            Likes: {s.totalLikes}
          </BodyText>
          <BodyText>
            Co-ordinates: {s.latitude}, {s.longitude}
          </BodyText>
        </div>
      ))}
    </div>
  )
}
