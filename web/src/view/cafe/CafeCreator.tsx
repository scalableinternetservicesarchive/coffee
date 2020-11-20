import * as React from 'react'
import { useState } from 'react'
import { Button } from '../../style/button'
import { H1 } from '../../style/header'
import { Spacer } from '../../style/spacer'
import { addCafe } from './mutateData'
// import { getApolloClient } from '../../graphql/apolloClient'

export function CafeCreator() {
  const [name, setName] = useState('')
  const [long, setLong] = useState(0)
  const [lat, setLat] = useState(0)

  function handleSubmit() {
    // TODO: check if cafe name is empty

    if (name === '') {
      alert('Please enter a cafe name.')
      return
    }

    addCafe(name, long, lat)
      .then(id => {
        console.log(`${id} created`)
        setName('')
        setLong(0.0)
        setLat(0.0)
      })
      .catch(err => console.log(err))
  }

  return (
    <div>
      <H1>Add a cafe</H1>
      <div style={{ display: 'flex', flexDirection: 'column', margin: '20px 0' }}>
        Name:
        <input
          placeholder="enter cafe name here"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        Latitude:{' '}
        <input
          type="number"
          step="0.0001"
          value={lat}
          onChange={e => setLat(Number(e.target.value))}
          style={{ marginBottom: '10px' }}
        />
        Longitude:
        <input
          type="number"
          step="0.0001"
          value={long}
          onChange={e => setLong(Number(e.target.value))}
          style={{ marginBottom: '10px' }}
        />
      </div>
      <Button onClick={handleSubmit}>Confirm</Button>
      <Spacer $h4 />
    </div>
  )
}
