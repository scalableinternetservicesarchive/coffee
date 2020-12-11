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


import * as argon2 from 'argon2';
import * as faker from 'faker';
import { writeFileSync } from 'fs';
import { metropolitanLocations } from '../../../common/src/metropolitanLocations';
import { Cafe } from '../entities/Cafe';
import { Like } from '../entities/Like';
import { Menu } from '../entities/Menu';
import { User } from '../entities/User';
import { initORM } from './sql';

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
  // warning - use with care.
  if (process.env.DELETE_EXISTING === 'yes' && process.env.NODE_ENV !== 'production') {
    console.log("Deleting existing data in the db... I hope you know what you're doing...")
    await dbConnection.query(`DELETE FROM \`session\` WHERE 1=1;`)
    await dbConnection.query(`DELETE FROM \`like\` WHERE 1=1;`)
    await dbConnection.query(`DELETE FROM \`cafe\` WHERE 1=1;`)
    await dbConnection.query(`DELETE FROM \`user\` WHERE 1=1;`)
    await dbConnection.query(`DELETE FROM \`menu\` WHERE 1=1;`)
  }

  const cafesToAdd = [];
  console.log(`Adding ${numCafes} cafes in total..`)

  const numChunks = metropolitanLocations.length
  for (let chunk_i = 0; chunk_i < numChunks; chunk_i++) {
    const chunkSize = chunk_i + 1 === numChunks ? Math.floor(numCafes/numChunks) + (numCafes % numChunks) : Math.floor(numCafes / numChunks)
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
  const usersToAdd = [];
  for (let i = 0; i < numUsers; i++) {
    if (i === numUsers - 1  || (i % 10 === 0 && i > 0)) {
      console.log(`Added ${i}th user`)
    }
    const user = {
      hashedPassword: '',
      firstName: faker.fake("{{name.firstName}}"),
      lastName: faker.fake("{{name.lastName}}"),
      email: faker.fake("{{internet.email}}"),
    };
    user.email = `${user.firstName}-${user.lastName}-${user.email}` // to avoid any conflicts
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
    for (let k = 0; k < numCafes; k++) {
        bucket.push(k);
    }
    // sample one without replacement
    const getRandomFromBucket = () => {
       const randomIndex = Math.floor(Math.random()*(bucket.length - 1));
       return bucket.splice(randomIndex, 1)[0];
    }

    for(let j = 0; j < numLikes; j++) {
      const l = getRandomFromBucket()
      const cafeId = cafeIdentifiers[l].id;
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

  console.log(`Adding menus to the database`);
  const menusToAdd = [];
  for (let i = 0; i< numCafes;i++)
  {
    const cafeId = cafeIdentifiers[i].id;
    //var numMenu = numCafes;
    //var menuDescription = 'sample menu, this is the sample menu'
    var menuDescription = faker.fake("{{lorem.words}}");
    var MenuId = i + 1;
    const Menu = {
        MenuId,
        cafeId,
        menuDescription
    }
    menusToAdd.push(Menu);



  }
  await dbConnection
    .createQueryBuilder()
    .insert()
    .into(Menu)
    .values(menusToAdd)
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
