/* Put all the metropolitan locations that we're going to use to loadtest here */
import { getHaversineDistanceMiles } from './haversine'
export const metropolitanLocations = [
  {
    name: "Los Angeles",
    slug: "los-angeles",
    lat: 34.0522,
    long: 118.2437,
  },
  {
    name: "New York City",
    slug: "new-york-city",
    lat: 40.7128,
    long: 74.0060,
  },
  {
    name: "Chicago",
    slug: "chicago",
    lat: 41.8781,
    long: 87.6298,
  },
  {
    name: "Austin",
    slug: "austin-tx",
    lat: 30.2672,
    long: 97.7431,
  },
  {
    name: "Miami",
    slug: "miami-fl",
    lat: 25.7617,
    long: 80.1918,
  },
  {
    name: "SF Bay Area",
    slug: "sf-bay-area",
    lat: 37.7749,
    long: 122.4194,
  },
  {
    name: "Phoenix",
    slug: "phoenix-az",
    lat: 33.5722,
    long: 112.0901,
  },
  /*
  {
    name: "Philadelphia",
    slug: "philadelphia-pa",
    lat: 40.0094,
    long: 75.1333,
  },
  {
    name: "Seattle",
    slug: "seattle-wa",
    lat: 47.6205,
    long: 122.3509,
  },
  */
  // NOTE: we can add more here to create more experiments.
]

// this is for the loadtesting script. We need to create a json that can be read by the load testing script.
// this is in the server/bin/common/src/ folder

export const getNearestMetroLocation = (lat: number, long: number) => {
  const metroAreaDistances = metropolitanLocations
  .map(o => ({
      ...o,
      distanceMiles: getHaversineDistanceMiles(lat, long, o.lat, o.long)
  }))
  return metroAreaDistances.reduce((acc, currVal) => acc.distanceMiles < currVal.distanceMiles? acc: currVal,
    {slug: '', distanceMiles: 10000000, lat: 0, long: 0, name: ''} // initial value
  );
}
