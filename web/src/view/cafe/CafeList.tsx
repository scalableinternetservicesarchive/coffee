import { useQuery } from '@apollo/client'
import * as React from 'react'
import { useContext } from 'react'
import { FetchCafes } from '../../graphql/query.gen'
import { Button } from '../../style/button'
import { H1, H2 } from '../../style/header'
import { Spacer } from '../../style/spacer'
import { BodyText } from '../../style/text'
import { fetchCafes } from './fetchData'
import { addLike } from './mutateData'
import { UserContext } from '../auth/user'
//import { getAllCafes } from './mutateData'

export function CafeList() {
  const [showStuff, setShowStuff] = React.useState(false)

  return (
    <div>
      <H1>All Cafes</H1>
      <Spacer $h4 />
      <Button onClick={() => setShowStuff(!showStuff)}>Show / Hide Cafes</Button>
      <Spacer $h4 />
      {showStuff && <FetchStuff />}
    </div>
  )
}

function FetchStuff() {
  const { user } = useContext(UserContext)
  const { loading, data } = useQuery<FetchCafes>(fetchCafes)

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
  if (!data || data.cafes.length === 0) {
    return <div>no cafes</div>
  }
  return (
    <div>
      {data.cafes.map((s, i) => (
        <div key={i} style={{ margin: '10px 0' }}>
          <H2>
            {s.name} { user && <span onClick={() => handleLike(s.id)}>♡</span> } 
          </H2>
          <BodyText>
            Co-ordinates: {s.latitude}, {s.longitude}
          </BodyText>
        </div>
      ))}
    </div>
  )
}
