import { useQuery } from '@apollo/client'
import * as React from 'react'
import { useContext } from 'react';
import { GetLikedCafes, GetLikedCafes_getLikedCafes } from '../../graphql/query.gen'
import { H3 } from '../../style/header'
import { BodyText } from '../../style/text'
import { fetchLikedCafes } from './fetchData'
import { addLike } from './mutateData'
import { UserContext } from '../auth/user'

export function LikedCafes () {
  const { loading, data } = useQuery<GetLikedCafes>(fetchLikedCafes)

  const { user } = useContext(UserContext)

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
            Co-ordinates: {s.latitude}, {s.longitude}
          </BodyText>
        </div>
      ))}
    </div>
  )
}
