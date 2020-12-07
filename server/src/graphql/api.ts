import { readFileSync } from 'fs'
import { PubSub } from 'graphql-yoga'
import path from 'path'
import { getConnection } from 'typeorm'
import { Cafe } from '../entities/Cafe'
import { Like } from '../entities/Like'
/*
import { check } from '../../../common/src/util'
import { Survey } from '../entities/Survey'
import { SurveyAnswer } from '../entities/SurveyAnswer'
import { SurveyQuestion } from '../entities/SurveyQuestion'
*/
import { User } from '../entities/User'
import {
  MutationAddCafeArgs,
  MutationAddLikeArgs,
  MutationDeleteLikeByIdArgs,
  MutationGetAllCafesArgs,
  Resolvers,
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

export const graphqlRoot: Resolvers<Context> = {
  Query: {
    self: (_, args, ctx) => ctx.user,
    cafes: () => Cafe.find(),
    likes: (_, { userId }) => Like.find({ where: { user: { id: userId } } }),
    allLikes: () => Like.find(),
    getTopTenCafes: async (_, {lat, long }) => {
      // TODO: do haversine distance when michael figures it out, OR:
      // https://www.databasejournal.com/features/mysql/mysql-calculating-distance-based-on-latitude-and-longitude.html
      // TODO: this is to be optimzied by using redis, and updated using a bg cron process.
      return await getConnection()
        .createQueryBuilder()
        .addSelect("COUNT(1)", "totalLikes")
        .addSelect("cafe.name", "name")
        .addSelect("latitude")
        .addSelect("longitude")
        .addSelect("cafe.name", "name")
        .addSelect("cafe.id", "id")
        .from(Cafe, "cafe")
        .innerJoin('cafe.likes', 'like')
        .groupBy('cafe.id')
        .orderBy({ totalLikes: "DESC" })
        .limit(10)
        .getRawMany() // use getRawMany since totalLikes isnt part of the entity, and is processed aggregated data.
      //
      /*
        SELECT COUNT(*) as totalLikes, c.name, c.id FROM cafe c
        INNER JOIN `like` l ON c.id = l.cafeId
        GROUP BY c.id
        ORDER BY totalLikes DESC
        LIMIT 10;
       */
    }
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
    addCafe: async (_, { name, long, lat }: MutationAddCafeArgs) => {
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
    /*
    answerSurvey: async (_, { input }, ctx) => {
      const { answer, questionId } = input
      const question = check(await SurveyQuestion.findOne({ where: { id: questionId }, relations: ['survey'] }))

      const surveyAnswer = new SurveyAnswer()
      surveyAnswer.question = question
      surveyAnswer.answer = answer
      await surveyAnswer.save()

      question.survey.currentQuestion?.answers.push(surveyAnswer)
      ctx.pubsub.publish('SURVEY_UPDATE_' + question.survey.id, question.survey)

      return true
    },
    nextSurveyQuestion: async (_, { surveyId }, ctx) => {
      // check(ctx.user?.userType === UserType.Admin)
      const survey = check(await Survey.findOne({ where: { id: surveyId } }))
      survey.currQuestion = survey.currQuestion == null ? 0 : survey.currQuestion + 1
      await survey.save()
      ctx.pubsub.publish('SURVEY_UPDATE_' + surveyId, survey)
      return survey
    },
  }
  Subscription: {
    surveyUpdates: {
      subscribe: (_, { surveyId }, context) => context.pubsub.asyncIterator('SURVEY_UPDATE_' + surveyId),
      resolve: (payload: any) => payload,
    },

  */
  },
}
