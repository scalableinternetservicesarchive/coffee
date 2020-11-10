/* 
 * this script initializes the database with dummy data in the following tables:
 *  - Cafe (specified by NUM_CAFE env var, default = 25)
 *  - User (specifeid NUM_USER env var, default = 100)
 *  - Like (specified by NUM_LIKE_PER_USER env var, default = 10)
 *
 * Run it as:
 * npm/yarn run addDummyData
 *
 * To alter the numbers above, simply put them as environment variables, e.g:
 *
 * NUM_CAFE=10000 NUM_USER=100 NUM_LIKE_PER_USER=10 npm/yarn run addDummyData
 */


import { initORM } from './sql';
import * as faker from 'faker';
import { Cafe } from '../entities/Cafe';

const main = async () => {
  const dbConnection = await initORM();
  const numCafes = parseInt(process.env.NUM_CAFE || '25');
  /*
  // TODO
  const numUsers = parseInt(process.env.NUM_USER || '100');
  const numLikes = parseInt(process.env.NUM_LIKE_PER_USER || '10');
 */

  const losAngelesLoc = { lat: 34.052235, lon: -118.243683 };

  const cafesToAdd = [];
  console.log(`Adding ${numCafes} cafes..`);
  for(let i = 0; i < numCafes; i++) {
    const latDelta = (0.1) * (Math.random() * 2 - 1);
    const lonDelta = (0.1) * (Math.random() * 2 - 1);
    const lat = losAngelesLoc.lat + latDelta;
    const lon = losAngelesLoc.lon + lonDelta;
    cafesToAdd.push({ name: faker.fake("{{lorem.words}}"), longitude: lon, latitude: lat });
  }

  await dbConnection
    .createQueryBuilder()
    .insert()
    .into(Cafe)
    .values(cafesToAdd)
    .execute();
  console.log(`DONE`);

}

main().then(() => {
  process.exit(0);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
