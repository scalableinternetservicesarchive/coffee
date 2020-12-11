import { useQuery } from '@apollo/client'
import * as React from 'react'
//import { getAllCafes } from './mutateData'
import { FetchMenus } from '../../graphql/query.gen'
import { Button } from '../../style/button'
import { H1, H2 } from '../../style/header'
import { Spacer } from '../../style/spacer'
import { BodyText } from '../../style/text'
import { fetchMenus } from './fetchData'

export function MenuList() {
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
  const { loading, data } = useQuery<FetchMenus>(fetchMenus)
  //const { loadingcafes, dataCafes} = useQuery<FetchCafes>(fetchCafes)
  /*
  function handleLike(cafeId: number) {
    addLike(cafeId)
      .then(id => {
        console.log(`like ${id} created`)
      })
      .catch(err => console.log(err))
  }
  */

  if (loading) {
    return <div>loading...</div>
  }
  if (!data || data.menus.length === 0) {
    if (!data) {
      console.log('null ptr')
    }
    return <div>no Menues data</div>
  }
  return (
    <div>
      {data.menus.map((s, i) => (
        <div key={i} style={{ margin: '10px 0' }}>
          <H2>{s.id}</H2>
          <BodyText>Menu is: {s.menuDescription}</BodyText>
        </div>
      ))}
    </div>
  )
}
