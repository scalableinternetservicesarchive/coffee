import { useQuery } from '@apollo/client'
import * as React from 'react'
//import { FetchCafes } from '../../graphql/query.gen'
import { FetchNearbyCafes } from '../../graphql/query.gen'
//import { Button } from '../../style/button'
import { H1, H3 } from '../../style/header'
import { Spacer } from '../../style/spacer'
import { BodyText } from '../../style/text'
//import { fetchCafes, fetchNearbyCafes } from './fetchData'
import { fetchNearbyCafes } from './fetchData'
import { useContext } from 'react'
import { UserContext } from '../auth/user'
import { getHaversineDistanceMiles } from '../../../../common/src/haversine'

import { addLike } from './mutateData'

import GoogleMapReact from 'google-map-react';


// TODO: replace with GPS here. (improvement, not necessary though)
let myLat =  34.06;
let myLong = 118.23;

export function CafeList() {
  return (
    <div>
      <H1>Cafes near me </H1>
      <Spacer $h4 />
      <FetchStuff/>
    </div>
  )
}

interface MyMarkerProps {
  text:    string;
  lat:     number;
  lng:     number;
  color?: string;
  bgcolor? : string;
}
const MyMarker = (props: MyMarkerProps) => (
  <div style={{
    color: props.color? props.color: 'white', 
    background: props.bgcolor? props.bgcolor: 'grey',
    padding: '15px 10px',
    display: 'inline-flex',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '100%',
    transform: 'translate(-50%, -50%)'
  }}>
    {props.text}
  </div>
);

function FetchStuff() {
  const { user } = useContext(UserContext)
  const { loading, data } = useQuery<FetchNearbyCafes>(fetchNearbyCafes, {
    variables: {
      lat: myLat,
      long: myLong,
      numResults: 10,
    }
  })

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
  if (!data || data.getNearbyCafes.length === 0) {
    return <div>no cafes near me </div>
  }
  const markers = data.getNearbyCafes.map((cafe) => (
    { name: cafe.name, latitude: cafe.latitude, longitude: -cafe.longitude }
  ))
  console.log("ALLA")

	
  return (
    <>
			<div style={{ height: '50vh', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{key: process.env.GMAPS_API_KEY || '' }}
          defaultCenter={{lat: myLat, lng: -myLong}}
          defaultZoom={13}
        >
          <MyMarker
            lat={myLat}
            lng={-myLong}
            text="You are here"
            bgcolor="green"
          />
          {markers.map(m => (
            <MyMarker
              lat={m.latitude}
              lng={m.longitude}
              text={m.name}
            />
          ))}
			
        </GoogleMapReact>
      </div>
      <div>
        {data.getNearbyCafes.map((s, i) => (
          <div key={i} style={{ margin: '10px 0' }}>
            <H3>
              {s.name} { user && <span onClick={() => handleLike(s.id)}>♡</span> }
            </H3>
            <BodyText>
              {getHaversineDistanceMiles(s.latitude, s.longitude, myLat, myLong).toFixed(1)} mi away
            </BodyText>
          </div>
        ))}
      </div>
    </>
  )
}
