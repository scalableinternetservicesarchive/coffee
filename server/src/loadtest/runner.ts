import { Lambda } from 'aws-sdk'
import 'cross-fetch/polyfill' // enables fetch in node
import { forAwaitEach } from 'iterall'
import { wait } from '../../../common/src/util'
import { LambdaFunc } from '../lambda/protocol'
import { UserScript } from './userScript'

/**
 * A load test is a sequence of arrival phases. Each phase, users arrive at the site and
 * execute the UserScript.
 */
interface ArrivalPhase {
  /**
   * How long the phase lasts, in seconds.
   */
  duration: number
  /**
   * Number of users arriving per second.
   */
  rate: number
}

const defaultPhases = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rate => ({ rate: rate * 5, duration: 30 }))

export async function loadTest(script?: UserScript, phases?: ArrivalPhase[]) {
  phases = phases || defaultPhases

  const totalSecs = phases.reduce((sum, { duration }) => sum + duration, 0)
  const totalUsers = phases.reduce((sum, { duration, rate }) => sum + duration * rate, 0)
  console.log(`[load] starting load test: ${phases.length} phases over ${totalSecs}, ${totalUsers} users`)
  for (let i = 0; i < phases.length; i++) {
    await runArrivalPhase(i, phases[i], script)
  }
  console.log('[load] done!')
}

function runArrivalPhase(i: number, { rate, duration }: ArrivalPhase, script?: UserScript) {
  return new Promise(resolve => {
    console.log(`[load] starting arrival phase ${i}: ${rate} users/sec for ${duration}`)
    let batchNum = 0
    let successTotal = 0
    let failureTotal = 0

    async function* perSecondBatchRunner() {
      // Loop until terminated (after arrival phase duration seconds)
      while (true) {
        const batch = ++batchNum
        runUserBatch(rate, script)
          .then(res => {
            const success = res.filter(r => r).length
            const fail = res.filter(r => !r).length
            console.log(`[load] arrival phase ${i} batch ${batch}: ${success} succeeded, ${fail} failed`)
            successTotal += success
            failureTotal += fail
          })
          .catch(err => console.error(err))
        await wait(1000) // wait a second to run the next batch
        yield true // unused
      }
    }

    const iter = perSecondBatchRunner()
    forAwaitEach(iter, () => null) // batch completed after a second
      .then(() => console.log(`[load] finished arrival phase ${i}: ${successTotal} succeeded, ${failureTotal} failed`))
      .catch(err => console.error(err))

    // End the batch runner after the arrival phase duration.
    // Complete the arival phase promise so the next phase can begin.
    setTimeout(() => {
      iter.return().catch(err => console.error(err))
      resolve()
    }, duration * 1000)
  })
}

let userNumber = 0 // incrementing user number

const lambda = new Lambda()

export function runUserBatch(numUsers: number, script?: UserScript) {
  if (script) {
    const promises = []
    for (let i = 0; i < numUsers; i++) {
      const userNum = ++userNumber
      console.log(`[load] user ${userNum} arriving`)
      promises.push(
        script()
          .then(() => {
            console.log(`[load] user ${userNum} finished`)
            return true
          })
          .catch(err => {
            // Catch and log error, we don't want a failure to stop the load test.
            console.log('[load] error running user script')
            console.error(err)
            return false
          })
      )
    }
    return Promise.all(promises)
  }

  // No script provided. Use lambda. Break into batches of at most 100.
  const promises = []
  let doneUsers = 0
  do {
    const batchSize = (numUsers - doneUsers) / 100 >= 1 ? 100 : numUsers - doneUsers
    console.log('[load] running batch on lambda')
    promises.push(
      lambda
        .invoke({
          FunctionName: 'cs188',
          InvocationType: 'Event',
          Payload: JSON.stringify({
            function: LambdaFunc.LOAD,
            args: {
              numUsers: batchSize,
            },
          }),
        })
        .promise()
        .then(res => {
          console.log(`[load] got lambda response ${res.StatusCode}: ${res.Payload}`)
          return true
        })
        .catch(err => {
          console.log('[load] error invoking lambda')
          console.error(err)
          return false
        })
    )
    doneUsers += batchSize
  } while (doneUsers < numUsers)
  return Promise.all(promises)
}
