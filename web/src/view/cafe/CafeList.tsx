import { useQuery } from '@apollo/client'
import * as React from 'react'
import { FetchCafes } from '../../graphql/query.gen'
import { Button } from '../../style/button'
import { H1, H2 } from '../../style/header'
import { Spacer } from '../../style/spacer'
import { BodyText } from '../../style/text'
import { fetchCafes } from './fetchData'
//import { getAllCafes } from './mutateData'
export function CafeList() {
  const [showStuff, setShowStuff] = React.useState(false)

  return (
    <p>
      <h1>All coffee list</h1>
      <Button onClick={() => setShowStuff(!showStuff)}>Get all Cafes</Button>
      {showStuff && <FetchStuff />}
    </p>
  )
}

function FetchStuff() {
  const { loading, data } = useQuery<FetchCafes>(fetchCafes)
  if (loading) {
    return <div>loading...</div>
  }
  if (!data || data.cafes.length === 0) {
    return <div>no cafes</div>
  }
  return (
    <div>
      <H1>All Cafes</H1>
      <Spacer $w2 />
      <div>
        {data.cafes.map((s, i) => (
          <div key={i}>
            <H2>{s.name}</H2>
            <BodyText>
              Co-ordinates: {s.latitude}, {s.longitude}
            </BodyText>
          </div>
        ))}
      </div>
    </div>
  )
}
