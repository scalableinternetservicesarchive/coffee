import { createPool, PoolConnection, QueryOptions } from 'mysql2'
import { createConnection } from 'typeorm'
import { Session } from '../entities/Session'
import { Survey } from '../entities/Survey'
import { SurveyAnswer } from '../entities/SurveyAnswer'
import { SurveyQuestion } from '../entities/SurveyQuestion'
import { User } from '../entities/User'

const baseConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3307),
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'bespin',
}

export async function initORM() {
  return await createConnection({
    ...baseConfig,
    type: 'mysql',
    username: process.env.MYSQL_USER || 'root',
    synchronize: true,
    logging: false,
    entities: [User, Session, Survey, SurveyQuestion, SurveyAnswer],
    extra: {
      connectionLimit: 5,
    },
  })
}

export async function query<T = any>(options: string | QueryOptions, values?: any) {
  const conn = await getConnection()
  try {
    return await sql<T>(conn, options, values)
  } finally {
    conn.release()
  }
}

export async function transaction<T>(cb: (conn: SQL) => Promise<T>) {
  return txn(null, cb)
}

export async function transactionLock<T>(lockSql: string, cb: (conn: SQL) => Promise<T>) {
  return txn(lockSql, cb)
}

const pool = createPool({
  ...baseConfig,
  user: 'root',
  connectionLimit: 16,
  multipleStatements: true,
} as any)

function getConnection() {
  return new Promise<PoolConnection>((resolve, reject) =>
    pool.getConnection((err, res) => (err ? reject(err) : resolve(res)))
  )
}

/**
 * Promisified {@code mysql.query}.
 */
function sql<T>(conn: PoolConnection, sql: any, values?: any) {
  return new Promise<T>((resolve, reject) =>
    conn.query(sql, values, (err, res) => (err ? reject(err) : resolve(res as any)))
  )
}

async function txn<T>(lockSql: string | null, cb: (conn: SQL) => Promise<T>) {
  const conn = await getConnection()
  let res: T | undefined
  let err: Error | undefined = undefined
  try {
    if (lockSql) {
      await sql(conn, 'LOCK TABLES ' + lockSql)
    }
    await sql(conn, 'SET autocommit=0')
    res = await cb(new SQL(conn))
    await sql(conn, 'COMMIT')
  } catch (e) {
    err = e
    await sql(conn, 'ROLLBACK')
  } finally {
    try {
      if (lockSql) {
        await sql(conn, 'UNLOCK TABLES')
      }
      await sql(conn, 'SET autocommit=1')
    } finally {
      conn.release()
    }
  }
  if (err) {
    throw err
  }
  return res as T
}

export class SQL {
  private conn: PoolConnection

  constructor(conn: PoolConnection) {
    this.conn = conn
  }

  query<T = any>(options: string | QueryOptions, values?: any) {
    return sql<T>(this.conn, options, values)
  }

  async insertAutoId(table: string, value: any) {
    const res = await this.query('INSERT INTO ?? SET ?', [table, value])
    return res
  }
}
