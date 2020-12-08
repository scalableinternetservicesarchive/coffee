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

export default function (data) {
  // first things first. Assign the VU to an actual user in the DB with an actual metropolitan location
  // can get user.id, user.firstName, user.lastName, etc.
  let user = sampleFromArray(data.users)
  // can get myLocation.long, myLocation.lat 
  const myLocation = sampleFromArray(data.metropolitanLocations)
  const latDelta = (0.1) * (Math.random() * 2 - 1)
  const longDelta = (0.1) * (Math.random() * 2 - 1)
  myLocation.lat += latDelta
  myLocation.long += longDelta

  //console.log("USER", JSON.stringify(user), JSON.stringify(myLocation))
  // First, they visit the site.
  recordRates(http.get('http://localhost:3000/app/index'))
  sleep(Math.random() * 3)

  let authRes;
  if (getBernoulliBool(data.probNewUser)) {
    user.email = `${user.firstName}.${user.lastName}-new-email-${crypto.randomBytes(1)[0]}@gmail.com`
    authRes = recordRates(http.post(
      'http://localhost:3000/auth/signup',
      JSON.stringify({password: user.firstName + user.lastName, firstName: user.firstName, lastName: user.lastName, email: user.email}),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ))
  } else {
    authRes = recordRates(http.post(
      'http://localhost:3000/auth/login',
      JSON.stringify({password: user.firstName + user.lastName, email: user.email}),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ))
  }
  // we use this authToken to authenticate further requests
  const authToken = authRes.cookies.authToken[0].value

  const gqlRes = recordRates(
    http.post(
      'http://localhost:3000/graphql',
      // loadtest AddCafe
      '{operationName: "AddCafe", variables: {name: "test cafe", long: 90, lat: 123},…}',
      /*
      //view top 10 cafes
      '{operationName: "GetTopTenCafesNearMe", variables: {lat: 34.06, long: -118.23},…}',

      //add menu
      'operationName: "addMenu", variables:{cafdId: 1, menuDescription: "my menu"}',

      //'{"operationName":"AddCafe","variables":{"name":"asdaasda","long":412,"lat":231},"query":"mutation AddCafe($name: String!, $long: Float!, $lat: Float!) {\n  addCafe(name: $name, long: $long, lat: $lat) {\n    id\n    __typename\n  }\n}\n"}',
      // loadtest AddLike 5 times
      '{"operationName":"AddLike","variables":{"cafeId":2},"query":"mutation AddLike($cafeId: Int!) {\n  addLike(cafeId: $cafeId) {\n    id\n    __typename\n  }\n}\n"}',
      '{"operationName":"AddLike","variables":{"cafeId":2},"query":"mutation AddLike($cafeId: Int!) {\n  addLike(cafeId: $cafeId) {\n    id\n    __typename\n  }\n}\n"}',
      '{"operationName":"AddLike","variables":{"cafeId":2},"query":"mutation AddLike($cafeId: Int!) {\n  addLike(cafeId: $cafeId) {\n    id\n    __typename\n  }\n}\n"}',
      '{"operationName":"AddLike","variables":{"cafeId":2},"query":"mutation AddLike($cafeId: Int!) {\n  addLike(cafeId: $cafeId) {\n    id\n    __typename\n  }\n}\n"}',
      '{"operationName":"AddLike","variables":{"cafeId":2},"query":"mutation AddLike($cafeId: Int!) {\n  addLike(cafeId: $cafeId) {\n    id\n    __typename\n  }\n}\n"}',

      // view top 10 cafes
      '{operationName: "GetTopTenCafesNearMe", variables: {lat: 34.06, long: -118.23},…}',
      */
      // loadtest FetchCafes
//{"operationName":"FetchCafes","variables":{},"query":"query FetchCafes {\n  cafes {\n    ...Cafe\n    __typename\n  }\n}\n\nfragment Cafe on Cafe {\n  id\n  name\n  longitude\n  latitude\n  __typename\n}\n"},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  )
  recordRates(
    http.post(
      'http://localhost:3000/graphql',
      //view top 10 cafes
      JSON.stringify({"operationName":"FetchCafes","variables":{},"query":"query FetchCafes {\n  cafes {\n    ...Cafe\n    __typename\n  }\n}\n\nfragment Cafe on Cafe {\n  id\n  name\n  longitude\n  latitude\n  __typename\n}\n"}),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  )
  recordRates(
    http.post(
      'http://localhost:3000/graphql',
      //add menu
      JSON.stringify({"operationName":"FetchCafes","variables":{},"query":"query FetchCafes {\n  cafes {\n    ...Cafe\n    __typename\n  }\n}\n\nfragment Cafe on Cafe {\n  id\n  name\n  longitude\n  latitude\n  __typename\n}\n"}),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  )
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
