import http from 'k6/http'
import { sleep } from 'k6'
import { Counter, Rate } from 'k6/metrics'
import crypto from 'k6/crypto'

// export const options = {
//   scenarios: {
//     example_scenario: {
//       executor: 'ramping-vus',
//       startVUs: 0,
//       stages: [
//         { duration: '60s', target: 5000 },
//         { duration: '60s', target: 0 },
//       ],
//       gracefulRampDown: '0s',
//     },
//   },
// }

export const options = {
  scenarios: {
    example_scenario: {
      executor: 'constant-vus',
      //vus: 1000,
      vus: 10, // temporary testing
      duration: '30s',
    },
  },
}

// some constants we can set for the loadtest
const probNewUser = 0.4  // 40% of the VUs will be signing up

function getRandomInt(max) {
  // uniformly distributed over 0 to (max - 1).
  return Math.floor(Math.random() * Math.floor(max))
}
function sampleFromArray(array) {
  return array[getRandomInt(array.length)]
}

// true or False with p(true ) = p
function getBernoulliBool(p) {
  return Math.random() < p
}

const users = JSON.parse(open('./users.json'))
const metropolitanLocations = JSON.parse(open('./metropolitanLocations.json'))

export function setup () {
  // we'll have to export the stuff by ourselves.
 return  {users, metropolitanLocations, probNewUser };
}

function doHttpCall(endpoint, payloadObj, authToken) {
  const k6Params = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  if (authToken) {
    k6Params.headers['x-authtoken'] = authToken
  }
  return recordRates(
    http.post(
      'http://localhost:3000' + endpoint,
      JSON.stringify(payloadObj),
      k6Params
    )
  )
}

function doGqlCall(operationName, query, variables={}, authToken) {
  return doHttpCall('/graphql', { operationName, query, variables }, authToken)
}

function getRandomCoordDelta() {
  return (0.1) * (Math.random() * 2 - 1)
}

export default function (data) {
  // first things first. Assign the VU to an actual user in the DB with an actual metropolitan location
  // can get user.id, user.firstName, user.lastName, etc.
  const user = sampleFromArray(data.users)
  // can get myLocation.long, myLocation.lat
  const myLocation = sampleFromArray(data.metropolitanLocations)
  myLocation.lat += getRandomCoordDelta()
  myLocation.long += getRandomCoordDelta()

  //console.log("USER", JSON.stringify(user), JSON.stringify(myLocation))
  // First, they visit the site.
  recordRates(http.get('http://localhost:3000/app/index'))
  sleep(Math.random() * 3)

  let authRes;
  if (getBernoulliBool(data.probNewUser)) {
    user.email = `${user.firstName}.${user.lastName}-new-email-${crypto.randomBytes(1)[0]}@gmail.com`
    authRes = doHttpCall('/auth/signup',
      {password: user.firstName + user.lastName, firstName: user.firstName, lastName: user.lastName, email: user.email},
    )
    const resBody = JSON.parse(authRes.body)
    user.id = resBody.id
  } else {
    authRes = doHttpCall('/auth/login', {password: user.firstName + user.lastName, email: user.email})
  }
  // we use this authToken to authenticate further requests
  const authToken = authRes.cookies.authToken[0].value

  const addCafeRes = doGqlCall('addCafe', `
    mutation addCafe($name: String!, $long: Float!, $lat: Float!) {
      addCafe(name: $name, long: $long, lat: $lat) {
        id
      }
    }
  `,
  {
    name: `${user.firstName}-${user.lastName}-cafe-${crypto.randomBytes(1)}`, 
    long: myLocation.long + getRandomCoordDelta(),
    lat: myLocation.lat + getRandomCoordDelta(),
  }, authToken)

  const getTopTenCafeRes = doGqlCall('getTopTenCafes', `
    query getTopTenCafes($lat: Float!, $long: Float!) {
      getTopTenCafes(lat: $lat, long: $long){
        id
        name
        totalLikes
        latitude
        longitude
      }
    }
  `,
  {
    long: myLocation.long,
    lat: myLocation.lat,
  }, authToken)

  const getNearbyCafeRes = doGqlCall('getNearbyCafes', `
    query getNearbyCafes($lat: Float!, $long: Float!, $numResults: Int) {
      getNearbyCafes(lat: $lat, long: $long, numResults: $numResults){
        id
        name
        totalLikes
        latitude
        longitude
      }
    }
  `,
  {
    long: myLocation.long,
    lat: myLocation.lat,
    numResults: 20,
  }, authToken)

  const getLikedCafesRes = doGqlCall('getLikedCafes', `
    query getLikedCafes {
      getLikedCafes{
        id
        name
      }
    }
  `,
  {}, authToken)
  // TODO: add a menu to a random cafe.
 
}


const count200 = new Counter('status_code_2xx')
const count300 = new Counter('status_code_3xx')
const count400 = new Counter('status_code_4xx')
const count500 = new Counter('status_code_5xx')

const rate200 = new Rate('rate_status_code_2xx')
const rate300 = new Rate('rate_status_code_3xx')
const rate400 = new Rate('rate_status_code_4xx')
const rate500 = new Rate('rate_status_code_5xx')

function recordRates(res) {
  if (res.status >= 200 && res.status < 300) {
    count200.add(1)
    rate200.add(1)
  } else if (res.status >= 300 && res.status < 400) {
    console.log(res.body)
    count300.add(1)
    rate300.add(1)
  } else if (res.status >= 400 && res.status < 500) {
    count400.add(1)
    rate400.add(1)
  } else if (res.status >= 500 && res.status < 600) {
    count500.add(1)
    rate500.add(1)
  }
  return res
}
