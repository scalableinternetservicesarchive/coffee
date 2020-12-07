import { useQuery } from '@apollo/client'
import * as React from 'react'
import { useContext } from 'react';
import { GetLikedCafes, GetLikedCafes_getLikedCafes } from '../../graphql/query.gen'
import { H3 } from '../../style/header'
import { BodyText } from '../../style/text'
import { fetchLikedCafes } from './fetchData'
import { addLike } from './mutateData'
import { UserContext } from '../auth/user'
import { getHaversineDistanceMiles } from '../../../../common/src/haversine'
// TODO: replace with GPS here. (improvement, not necessary though)
// similar like a context
let myLat =  34.06;
let myLong = 118.23;

export function LikedCafes () {
  const { user } = useContext(UserContext)
  if (!user) {
    return <div>Sign up or log in to like a cafe!</div>
  }

  const { loading, data } = useQuery<GetLikedCafes>(fetchLikedCafes)
  // TODO: figure out handleLike here too
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
  if (!data || data.getLikedCafes.length === 0) {
    return <div>no cafes liked yet. Click on the heart icons to like a cafe!</div>
  }
  return (
    <div>
      {data.getLikedCafes.map((s: GetLikedCafes_getLikedCafes) => (
        <div key={s.id} style={{ margin: '10px 0' }}>
          <H3>
            {s.name} { user && <span onClick={() => handleLike(s.id)}>♥</span> }
          </H3>
          <BodyText>
            {getHaversineDistanceMiles(s.latitude, s.longitude, myLat, myLong).toFixed(1)} mi away
          </BodyText>
        </div>
      ))}
    </div>
  )
}
