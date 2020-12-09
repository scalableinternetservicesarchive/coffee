import http from 'k6/http'
import { sleep } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'
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
      //vus: 1,
      //vus: 10, 
      //vus: 100, 
      //vus: 500, 
      vus: 1000, 
      //vus: 2500, 
      duration: '90s',
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

function doHttpCall(endpoint, payloadObj, authToken, routeName) {
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
    ),
    routeName
  )
}

function doGqlCall(operationName, query, variables={}, authToken) {
  return doHttpCall('/graphql', { operationName, query, variables }, authToken, operationName)
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

  // First, they visit the site.
  recordRates(http.get('http://localhost:3000/app/index'), 'homepage')
  sleep(Math.random() * 3)

  let authRes;
  if (getBernoulliBool(data.probNewUser)) {
    user.email = `${user.firstName}.${user.lastName}-new-email-${crypto.randomBytes(1)[0]}@gmail.com`
    authRes = doHttpCall('/auth/signup',
      {password: user.firstName + user.lastName, firstName: user.firstName, lastName: user.lastName, email: user.email},
      null,
      'signup'
    )
    const resBody = JSON.parse(authRes.body)
    user.id = resBody.id
  } else {
    authRes = doHttpCall('/auth/login', {password: user.firstName + user.lastName, email: user.email}, null, 'login')
  }
  // we use this authToken to authenticate further requests
  const authToken = authRes.cookies.authToken[0].value
  sleep(Math.random() * 2)

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

  sleep(Math.random() * 2)
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

  sleep(Math.random() * 2)
  const getNearbyCafeRes = doGqlCall('getNearbyCafes', `
    query getNearbyCafes($lat: Float!, $long: Float!, $numResults: Int) {
      getNearbyCafes(lat: $lat, long: $long, numResults: $numResults){
        id
        name
        latitude
        longitude
      }
    }
  `,
  {
    long: myLocation.long,
    lat: myLocation.lat,
    numResults: 35,
  }, authToken)
  sleep(Math.random() * 2)

  const nearbyCafes = JSON.parse(getNearbyCafeRes.body).data.getNearbyCafes

  const getLikedCafesRes = doGqlCall('getLikedCafes', `
    query getLikedCafes {
      getLikedCafes{
        id
        name
      }
    }
  `,
  {}, authToken)

  const newCafeId = JSON.parse(addCafeRes.body).data.addCafe.id

  const addMenuRes = doGqlCall('addMenu', `
    mutation addMenu($cafeId: Int!, $item: String! {
      addMenu(cafeId: $cafeId, item: $item) {
        id
        menuDescription
      }
    }
  `,
  {
    cafeId: newCafeId,
    item: 'put new menu here'
  }, authToken)
  // get cafe ids that haven't been liked
  sleep(Math.random() * 2)
  const likedCafeIds = JSON.parse(getLikedCafesRes.body).data.getLikedCafes.map((x) => x.id)
  const cafeIdsToLike = nearbyCafes.filter((c) => !likedCafeIds.includes(c.id)).map((x) => x.id);

  for (let i = 0; i < Math.min(5, cafeIdsToLike.length); ++i) {
    // view a cafe's menu, and then like a cafe.
    const cafeId = cafeIdsToLike[i];

    const getMenuForCafeIdRes = doGqlCall('getMenuForCafeId', `
      query getMenuForCafeId ($cafeId: Int!) {
        getMenuForCafeId (cafeId: $cafeId) {
            id
            menuDescription
          }
      }
    `,
    {cafeId}, authToken)
    const addLikeRes = doGqlCall('addLike', `
      mutation addLike($cafeId: Int!) {
        addLike(cafeId: $cafeId){
          id
          cafe {
            id
          }
        }
      }
    `,
    { cafeId },
     authToken)
    sleep(Math.random() * 2)
  }
  // then, view top 10 cafes
  const getTopTenCafe2Res = doGqlCall('getTopTenCafes', `
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
  sleep(Math.random() * 4)
  // finally log out.
  doHttpCall('/auth/logout', {}, authToken, 'logout')
}


const count200 = new Counter('status_code_2xx')
const count300 = new Counter('status_code_3xx')
const count400 = new Counter('status_code_4xx')
const count500 = new Counter('status_code_5xx')

const rate200 = new Rate('rate_status_code_2xx')
const rate300 = new Rate('rate_status_code_3xx')
const rate400 = new Rate('rate_status_code_4xx')
const rate500 = new Rate('rate_status_code_5xx')
const zero_duration_requests = new Counter('zero_duration_requests')
const routeLevelResponseTimes = {}

const aggResponseTimes = new Trend('agg_response_time')
const routes = ['homepage', 'signup', 'login', 'logout', 'addCafe', 'getTopTenCafes', 'getNearbyCafes', 'getLikedCafes', 'addMenu', 'getMenuForCafeId', 'addLike']
routes.forEach((routeName) => {
  routeLevelResponseTimes[routeName] = new Trend(`route-${routeName}`)
})

function recordRates(res, routeName) {
  if (!routeLevelResponseTimes[routeName]) {
    throw new Error("trend metric for "+routeName+" not registered.")
  }
  if (res.timings.duration > 0) {
    routeLevelResponseTimes[routeName].add(res.timings.duration)
    aggResponseTimes.add(res.timings.duration)
  } else {
    zero_duration_requests.add(1)
  }
  if (res.status >= 200 && res.status < 300) {
    count200.add(1)

    rate200.add(1)
    rate500.add(0)
    rate300.add(0)
    rate400.add(0)
  } else if (res.status >= 300 && res.status < 400) {
    console.log(res.body)
    count300.add(1)

    rate300.add(1)
    rate200.add(0)
    rate400.add(0)
    rate500.add(0)
  } else if (res.status >= 400 && res.status < 500) {
    console.log(res.body)
    count400.add(1)

    rate400.add(1)
    rate200.add(0)
    rate300.add(0)
    rate500.add(0)
  } else if (res.status >= 500 && res.status < 600) {
    count500.add(1)

    rate500.add(1)
    rate200.add(0)
    rate300.add(0)
    rate400.add(0)
  }
  return res
}
