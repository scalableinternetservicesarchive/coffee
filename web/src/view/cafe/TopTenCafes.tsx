import { useQuery } from '@apollo/client'
import * as React from 'react'
import { useContext } from 'react';
import { GetTopTenCafesNearMe, GetTopTenCafesNearMe_getTopTenCafes } from '../../graphql/query.gen'
import { getNearestMetroLocation } from '../../../../common/src/metropolitanLocations'
import { getHaversineDistanceMiles } from '../../../../common/src/haversine'
import { H2, H4 } from '../../style/header'
import { BodyText } from '../../style/text'
import { fetchTopTenCafesNearMe } from './fetchData'
import { addLike } from './mutateData'
import { UserContext } from '../auth/user'
// TODO: replace with GPS here. (improvement, not necessary though)
let myLat =  34.06;
let myLong = 118.23;

export function TopTenCafes () {
  const { loading, data } = useQuery<GetTopTenCafesNearMe>(fetchTopTenCafesNearMe, {
    variables: {
      lat: myLat,
      long: myLong
    }
  })

  const { user } = useContext(UserContext)

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
  const nearestMetroArea = getNearestMetroLocation(myLat, myLong)
  return (
    <div>
      <H2>
        Top 10 cafes in {nearestMetroArea.name}
      </H2>
      {data.getTopTenCafes.map((s: GetTopTenCafesNearMe_getTopTenCafes) => (
        <div key={s.id} style={{ margin: '10px 0' }}>
          <H4>
            {s.name} { user && <span onClick={() => handleLike(s.id)}>♡</span> }
          </H4>
          <BodyText>
            Likes: {s.totalLikes}
          </BodyText>
          <BodyText>
            {getHaversineDistanceMiles(s.latitude, s.longitude, myLat, myLong).toFixed(1)} mi away
          </BodyText>
        </div>
      ))}
    </div>
  )
}
