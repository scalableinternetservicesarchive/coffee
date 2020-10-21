import { APIGatewayProxyEvent, APIGatewayProxyResult, Context as LambdaContext } from 'aws-lambda'
import { Request } from 'express'
import { runUserBatch } from '../loadtest/runner'
import { userScript } from '../loadtest/userScript'
import { LambdaFunc, ServiceReq, ServiceResp } from './protocol'

export const handler = async (req: any, ctx: any) => {
  try {
    if (req.httpMethod != null) {
      return await handleHttpReq(req, ctx)
    } else {
      return await handleServiceReq(req, ctx)
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function handleServiceReq(req: ServiceReq, ctx: LambdaContext): Promise<ServiceResp> {
  switch (req.function.toUpperCase()) {
    case LambdaFunc.PING:
      return {
        result: 'pong',
      }

    case LambdaFunc.LOAD:
      return {
        result: await runUserBatch(req.args.numUsers, userScript),
      }

    default:
      throw new Error(`no handler for '${req.function}'`)
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function handleHttpReq(req: APIGatewayProxyEvent, ctx: LambdaContext): Promise<APIGatewayProxyResult> {
  const func = req.pathParameters?.function || LambdaFunc.PING

  try {
    switch (func.toUpperCase()) {
      case LambdaFunc.PING:
        return Promise.resolve({
          statusCode: 200,
          headers: {},
          body: 'pong',
        })

      default:
        return Promise.resolve({ statusCode: 404, headers: {}, body: `no function handler for ${func}` })
    }
  } catch (ex) {
    return Promise.resolve({ statusCode: 500, headers: {}, body: ex.toString() })
  }
}

/**
 * Proxies an express req into the lambda handler
 */
export function expressLambdaProxy(req: Request) {
  const context = {}
  const func = req.params.function
  return handler(
    {
      resource: '/api/:function',
      path: '/api/' + func,
      httpMethod: req.method,
      headers: req.headers,
      queryStringParameters: req.query,
      pathParameters: {
        function: func,
      },
      body: JSON.stringify(req.body),
    },
    context
  ) as Promise<APIGatewayProxyResult>
}
