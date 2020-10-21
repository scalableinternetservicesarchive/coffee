import { ApiGatewayManagementApi } from 'aws-sdk'
import { Request } from 'express'
import { strutil } from '../../../common/src/util'
import { Config } from '../config'

const connectionDB: { [connId: string]: { [opId: number]: AsyncIterator<any> } } = {}

const apiGateway = new ApiGatewayManagementApi({ endpoint: Config.wsUrl.replace('wss://', '') })

export class ConnectionManager {
  static getConnId(req: Request) {
    return req.header('connectionid')!
  }

  static send(connId: string, payload: string) {
    console.log(`[ws] sending message to ${connId}: ${strutil.truncate(payload)}`)
    return apiGateway.postToConnection({ ConnectionId: connId, Data: payload }).promise()
  }

  static connect(req: Request) {
    const connId = ConnectionManager.getConnId(req)
    console.log(`[ws] disconnecting ${connId}`)
    connectionDB[connId] = {}
  }

  static disconnect(req: Request) {
    const connId = ConnectionManager.getConnId(req)
    console.log(`[ws] disconnecting ${connId}`)
    Object.keys(connectionDB[connId] || {}).forEach(opId => {
      ConnectionManager.endSubscription(connId, Number(opId))
    })
    delete connectionDB[connId]
  }

  static registerSubscription(connId: string, opId: number, iter: AsyncIterator<any>) {
    console.log(`[ws] registering subscription ${connId}:${opId}`)
    if (!connectionDB[connId]) {
      connectionDB[connId] = {}
    }
    connectionDB[connId][opId] = iter
  }

  static endSubscription(connId: string, opId: number) {
    console.log(`[ws] ending subscription ${connId}:${opId}`)
    const ops = connectionDB[connId] || {}
    if (ops?.[opId]?.return) {
      ops[opId].return!().catch(err => console.error(err))
    }
    delete ops[opId]
  }
}
