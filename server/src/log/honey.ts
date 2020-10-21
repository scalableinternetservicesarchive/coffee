import { check } from '../../../common/src/util'
import { Config } from '../config'

const logToStdOut = Config.isProd
const bufferEvents = !Config.isProd && Config.honeyKey

// Avoid memory leak if Honey upload fails for any reason.
// We never accumulate more than 5000 log entries in normal operation. See:
// https://app.logdna.com/692ffbb34b/logs/view?b=1074495137213321218&e=1074497369760305159&q=honeycomb%20uploading
const MAX_PENDING_LOGS = 10000

interface HoneyEvent {
  /**
   * ISO time
   */
  time: string
  /**
   * The sample rate for the event
   */
  samplerate: number
  /**
   * A JSON event
   */
  data: any
}

const honeyClients: { [dataset: string]: HoneyClient } = {}

export class HoneyClient {
  private dataset: string
  private pendingLogs: HoneyEvent[] = []

  private constructor(dataset: string) {
    this.dataset = dataset
  }

  public static async init(deployMarker: string) {
    return Promise.all(
      Config.honeyDatasets.map(HoneyClient.get).map(client => client.createMarker('deploy', deployMarker))
    )
  }

  public static get(dataset: string) {
    let client = honeyClients[dataset]
    if (client) {
      return client
    }
    client = new HoneyClient(dataset)
    honeyClients[dataset] = client
    return client
  }

  public async createMarker(type: 'deploy', message: string) {
    try {
      await post('/1/markers/' + this.dataset, {
        type,
        message,
        start_time: new Date().getTime() / 1000,
      })
    } catch (e) {
      console.error(e)
    }
  }

  public log(arg: { data: any; time?: Date; sampleRate?: number }) {
    const event: HoneyEvent = {
      time: (arg.time || new Date()).toISOString(),
      samplerate: arg.sampleRate || 1,
      data: arg.data,
    }

    if (logToStdOut) {
      console.log(`[honey] logging event to ${this.dataset}: ${JSON.stringify(event)}`)
    }
    if (bufferEvents) {
      if (this.pendingLogs.length > MAX_PENDING_LOGS) {
        console.log('[honey] max pending logs reached, dropping event')
        return
      }
      this.pendingLogs.push(event)
    }
  }

  public static async batchUploadAll() {
    await Promise.all(Object.values(honeyClients).map(c => c.batchUpload()))
  }

  private async batchUpload() {
    const logs = this.pendingLogs
    if (logs.length === 0) {
      return
    }

    // clear pending logs and send
    this.pendingLogs = []
    try {
      await post('/1/batch/' + this.dataset, logs)
    } catch (e) {
      console.error(e)
    }
  }
}

async function post(path: string, json: any) {
  if (!Config.honeyKey) {
    console.log('[honey] not POSTing to honeycomb, no API key set on environment')
    return
  }

  const res = await fetch('https://api.honeycomb.io' + path, {
    method: 'POST',
    headers: {
      'X-Honeycomb-Team': Config.honeyKey,
    },
    body: JSON.stringify(json),
  })

  const resp = await res.json()
  check(res.status >= 200 && res.status < 300, '[honey] error posting: ' + JSON.stringify(resp))
  return resp
}
