import { readFileSync } from 'fs'
import { PubSub } from 'graphql-yoga'
import { redis } from '../db/redis'
import path from 'path'
import { getConnection } from 'typeorm'
import { Cafe } from '../entities/Cafe'
import { Like } from '../entities/Like'
import { Menu } from '../entities/Menu'
import { getNearestMetroLocation } from '../../../common/src/metropolitanLocations'
import { User } from '../entities/User'
import {
  MutationAddCafeArgs,
  MutationAddLikeArgs,


  MutationAddMenuArgs,
  MutationDeleteLikeByIdArgs,
  MutationGetAllCafesArgs,

  Resolvers
} from './schema.types'

export const pubsub = new PubSub()

export function getSchema() {
  const schema = readFileSync(path.join(__dirname, 'schema.graphql'))
  return schema.toString()
}

interface Context {
  user: User | null
  request: Request
  response: Response
  pubsub: PubSub
}
const redisTtlSecs = parseInt(process.env.REDIS_CACHE_TTL_SECS || '30') || 30

export const graphqlRoot: Resolvers<Context> = {
  Query: {
    self: (_, args, ctx) => ctx.user,
    cafes: () => Cafe.find(),
    likes: (_, { userId }) => Like.find({ where: { user: { id: userId } } }),
    allLikes: () => Like.find(),

    getMenuForCafeId: async (_, args, ctx) => {
      // get menu for cafeid
      if (!ctx.user) {
        throw new Error('No user detected.')
      }
      return await getConnection()
        .createQueryBuilder()
        // .addSelect('cafe.name', 'name')
        // .addSelect('cafe.latitude', 'latitude')
        // .addSelect('cafe.longitude', 'longitude')
        .addSelect('menu.cafeId', 'cafeId')
        .addSelect('menu.id', 'id')
        .addSelect('menu.menuDescription', 'menuDescription')
        .from(Menu, 'menu')
        .where('menu.cafeId = :cafeId', { cafeId: args.cafeId })
        .getRawOne()
    },
    getLikedCafes: async (_, args, ctx) => {
      // get my liked cafes
      if (!ctx.user) {
        throw new Error('No user detected.')
      }
      return await getConnection()
        .createQueryBuilder()
        .addSelect('cafe.name', 'name')
        .addSelect('cafe.latitude', 'latitude')
        .addSelect('cafe.longitude', 'longitude')
        .addSelect('cafe.id', 'id')
        .from(Like, 'like')
        .innerJoin('like.cafe', 'cafe')
        .where('like.userId = :userId', { userId: ctx.user.id })
        .getRawMany()
    },
    getNearbyCafes: async (_, { lat, long, numResults }) => {
      // TODO: possibly implement pagination later if we have time
      const numRes = numResults || 10;
       const res = await getConnection()
      .query(`
          SELECT
            cafe.name as name,
            cafe.latitude as latitude,
            cafe.longitude as longitude,
            cafe.id as id
          FROM cafe
          WHERE ROUND(haversineMiles(cafe.latitude, cafe.longitude, ?, ?), 3) <= 60
          ORDER BY haversineMiles(cafe.latitude, cafe.longitude, ?, ?) ASC
          LIMIT ?
       `, [lat, long, lat, long, numRes ])
       return res
    },

    getTopTenCafes: async (_, { lat, long }) => {
      // fetches the top ten cafes in the nearest metropolitan area of the person.
      // can do experiments here to vary the number of metropolitan areas when not using cache. 
      // default radius: 60mi
      const fetchTopTenCafes = async (lat: number, long: number) => {
        // we use the haversine formula, as shown in 
        // https://www.plumislandmedia.net/mysql/stored-function-haversine-distance-computation/
        // the haversine function haversineMiles is defined in the db migration sql files
         const res = await getConnection()
        .query(`
          SELECT
            nearbyCafes.name,
            nearbyCafes.latitude,
            nearbyCafes.longitude,
            nearbyCafes.id,
            COUNT(1) AS totalLikes
          FROM (
            SELECT
              cafe.name as name,
              cafe.latitude as latitude,
              cafe.longitude as longitude,
              cafe.id as id
            FROM cafe
            WHERE ROUND(haversineMiles(cafe.latitude, cafe.longitude, ?, ?), 3) <= 60
          ) nearbyCafes
          INNER JOIN \`like\` l ON l.cafeId = nearbyCafes.id
          GROUP BY nearbyCafes.id
          ORDER BY totalLikes DESC
          LIMIT 10;
         `, [lat, long, lat, long])
         return res
      };
      // first, get the nearest metropolitan location.
      const nearestMetroArea = getNearestMetroLocation(lat, long)

      if (process.env.ENABLE_CACHING_OPTIMIZATION === "yes") {
        const redisKey = 'top-10-' + nearestMetroArea.slug
        const cacheResult = await redis.get(redisKey)
        let data;
        if (cacheResult) {
          try {
            data = JSON.parse(cacheResult)
            return data
          } catch(e) {
            console.log("Invalid JSON in redis cache value. Re-querying & saving to cache")
          }
        }
        data = await fetchTopTenCafes(nearestMetroArea.lat, nearestMetroArea.long)
        await redis.setex(redisKey, redisTtlSecs, JSON.stringify(data))
        return data
      } else {
        return await fetchTopTenCafes(nearestMetroArea.lat, nearestMetroArea.long)
      }
    },
  },
  Mutation: {
    addLike: async (_, { cafeId }: MutationAddLikeArgs, ctx: Context) => {
      if (!ctx.user) {
        throw new Error('No user detected.')
      }
      const newLike = new Like()
      const cafe = await Cafe.findOne({ where: { id: cafeId } })
      if (!cafe) {
        throw new Error('Cafe not found.')
      }

      newLike.cafe = cafe
      newLike.user = ctx.user

      await newLike.save()
      return newLike
    },
    deleteLikeById: async (_, { likeId }: MutationDeleteLikeByIdArgs, ctx: Context) => {
      if (!ctx.user) {
        throw new Error('No user detected.')
      }
      const res = await getConnection()
        .createQueryBuilder()
        .delete()
        .from(Like)
        .where('id = :id AND userId = :userId', { id: likeId, userId: ctx.user.id })
        .execute()

      return res.raw.affectedRows === 1
    },

    addMenu: async (_, {cafeId, item}: MutationAddMenuArgs) =>{
      const c = new Menu()
      //c.id = cafeId
      c.cafeId = cafeId
      c.menuDescription = item

      const newMenu = await c.save()
      return newMenu
    },

    addCafe: async (_, { name, long, lat }: MutationAddCafeArgs) => {
      console.log("addCafe called", )
      const c = new Cafe()
      c.name = name
      c.longitude = long
      c.latitude = lat

      await c.save()
      return c
    },

    getAllCafes: async (_, { cafeId }: MutationGetAllCafesArgs) => {
      let cafeList: Cafe[] = []
      cafeList = await getConnection()
        .createQueryBuilder()
        .select('Cafe')
        .from(Cafe, 'CafeList')
        .where('Cafe.id = cafeId')
        .getMany()

      return cafeList
    },
  },
}
