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
 *
 * EVery person's password is their first name and last name, except for wilson's (which is in the sql migration script)
 */


import { initORM } from './sql';
import * as faker from 'faker';
import * as argon2 from 'argon2';
import { Cafe } from '../entities/Cafe';
import { User } from '../entities/User';
import { metropolitanLocations } from '../../../common/src/metropolitanLocations'
import { Like } from '../entities/Like';
import { writeFileSync } from 'fs'

const main = async () => {
  const dbConnection = await initORM();
  const numCafes = parseInt(process.env.NUM_CAFE || '25');
  const numUsers = parseInt(process.env.NUM_USER || '100');
  const numLikes = parseInt(process.env.NUM_LIKE_PER_USER || '10');

  if (numCafes === 0 || numUsers === 0 || numLikes === 0) {
    console.error("ERROR: NUM_CAFE, NUM_USER, NUM_LIKE_PER_USER must all be > 0.")
    process.exit(1);
  }

  if (numLikes > numCafes) {
    console.error("ERROR: number of likes per user > number of cafes");
    process.exit(1);
  }

  const cafesToAdd = [];
  console.log(`Adding ${numCafes} cafes in total..`)

  const numChunks = metropolitanLocations.length
  for (let chunk_i = 0; chunk_i < numChunks; chunk_i++) {
    const chunkSize = chunk_i + 1 === numChunks ? Math.ceil(numCafes/numChunks) : Math.floor(numCafes / numChunks)
    console.log(`Adding ${chunkSize} cafes to ${metropolitanLocations[chunk_i].name}...`);
    for(let i = 0; i < chunkSize; i++) {
      const latDelta = (0.1) * (Math.random() * 2 - 1);
      const lonDelta = (0.1) * (Math.random() * 2 - 1);
      const lat = metropolitanLocations[chunk_i].lat + latDelta;
      const lon = metropolitanLocations[chunk_i].long + lonDelta;
      cafesToAdd.push({ name: faker.fake("{{lorem.words}}"), longitude: lon, latitude: lat });
    }

  }

  const { identifiers: cafeIdentifiers } = await dbConnection
    .createQueryBuilder()
    .insert()
    .into(Cafe)
    .values(cafesToAdd)
    .execute();

  console.log(`DONE`);


  console.log(`Adding ${numUsers} users..`);
  //const hashedPassword = await argon2.hash("password123");
  const usersToAdd = [];
  for (let i = 0; i < numUsers; i++) {
    console.log("ADDED USER", i)
    const user = {
      hashedPassword: '',
      firstName: faker.fake("{{name.firstName}}"),
      lastName: faker.fake("{{name.lastName}}"),
      email: faker.fake("{{internet.email}}"),
    };
    const hashedPassword = await argon2.hash(user.firstName+ user.lastName);
    user.hashedPassword = hashedPassword
    usersToAdd.push(user);
  }

  const { identifiers: userIdentifiers } = await dbConnection
    .createQueryBuilder()
    .insert()
    .into(User)
    .values(usersToAdd)
    .execute();
  console.log("DONE")

  console.log(`Adding ${numLikes} likes for each user...`);
  const likesToAdd = [];
  for(let i = 0; i < numUsers; i++) {
    const userId = userIdentifiers[i].id;
    let bucket: number[] = [];
    for (let k = 0; k <= numCafes; k++) {
        bucket.push(k);
    }
    // sample one without replacement
    const getRandomFromBucket = () => {
       const randomIndex = Math.floor(Math.random()*(bucket.length - 1));
       return bucket.splice(randomIndex, 1)[0];
    }

    for(let j = 0; j < numLikes; j++) {
      const cafeId = cafeIdentifiers[getRandomFromBucket()].id;
      const like = {
        cafeId,
        userId
      };
      likesToAdd.push(like);
    }
  }

  await dbConnection
    .createQueryBuilder()
    .insert()
    .into(Like)
    .values(likesToAdd) 
    .execute();
  console.log("DONE");
  console.log("Updating loadtest users.json file...")
  const users = await dbConnection
    .query('SELECT id, firstName, lastName, email FROM user')


  const usersJsonPath = __dirname + '/../../../../src/loadtest/users.json'
    // create new one
  writeFileSync(usersJsonPath, JSON.stringify(users));
  console.log("DONE");
}

main().then(() => {
  process.exit(0);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
