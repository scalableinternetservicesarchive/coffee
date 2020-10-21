import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { check, hashCode } from '../../../common/src/util'
import { Config } from '../config'
import { query, SQL, transaction, transactionLock } from './sql'

const table = 'migration_schema_history'

/**
 * Runs migration manager. Should run and finish executing before the server begins accepting requests.
 */
export async function migrate(): Promise<void> {
  console.log('[db] migrate')

  await createMigrationTableIfNotExists()
  const migrations = readMigrations()

  await transactionLock(`${table} write`, async sql => {
    console.log('[db] acquired migration table lock')
    await checkFailedMigrations(sql)

    // Get all successful migrations from the DB.
    const successes = await sql.query<Migration[]>('SELECT * from ?? where success=?', [table, true])
    // Verify successful migrations exist and have not been modified.
    let currRank = checkSuccessfulMigrations(successes, migrations)

    // Run each of the new migrations that haven't been run yet.
    console.log(`[db] running ${migrations.length - successes.length} migrations`)
    for (let i = successes.length; i < migrations.length; i++) {
      const success = await runMigration(migrations[i], currRank, sql)
      if (!success) {
        console.log('[db] aborting further migrations until failure is fixed')
        return
      }
      currRank += 1
    }
  })
}

/**
 * Represents a migration file.
 */
interface MigrationInput {
  /**
   * The version number of the migration, e.g. "1.5"
   */
  version: string
  /**
   * The description of the migration, e.g. "Create_user_table"
   */
  description: string
  /**
   * Migration .sql file content hash code.
   */
  checksum: number
  /**
   * Contents of the .sql file.
   */
  sqlString: string
}

/**
 * Represents a row in the migration_schema_history table.
 */
interface Migration extends Omit<MigrationInput, 'sqlString'> {
  /**
   * The non-auto-incrementing record for migration executions.
   *
   * Each migration version should increment the installed_rank by one.
   */
  installed_rank: number
  /**
   * Application identifier who ran the migration.
   */
  installed_by: string
  /**
   * Total duration of execution of the migration.
   */
  execution_time: number
  /**
   * Did the migration complete without error.
   */
  success: boolean
}

/**
 * Creates the table used to track migration versions.
 */
async function createMigrationTableIfNotExists() {
  return await query(`CREATE TABLE IF NOT EXISTS ${table} (
    installed_rank int(11) NOT NULL,
    version varchar(50) COLLATE utf8mb4_bin DEFAULT NULL,
    description varchar(200) COLLATE utf8mb4_bin NOT NULL,
    checksum int(11) DEFAULT NULL,
    installed_by varchar(100) COLLATE utf8mb4_bin NOT NULL,
    installed_on timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_time int(11) NOT NULL,
    success tinyint(1) NOT NULL,
    PRIMARY KEY (installed_rank),
    KEY (success)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin`)
}

/**
 * Reads .sql files from the `db/migrations` folder. Parses them and throws an exception if any are unparseable.
 */
function readMigrations() {
  return fs.readdirSync(path.join(__dirname, 'migrations')).sort().map(parseMigrationInput)
}

/**
 * Migration files should look like `V1.1__Some_helpful_description.sql`.
 *
 * Parses the fileName and reads file contents.
 */
function parseMigrationInput(fileName: string): MigrationInput {
  const match = check(
    /V(\d+\.\d+)__(\w+)\.sql/g.exec(fileName),
    `Migration ${fileName} doesn't match expected format 'V#.#__Description.sql'`
  )
  const sqlString = fs.readFileSync(path.join(__dirname, 'migrations', fileName)).toString()
  return {
    sqlString,
    version: match[1],
    description: match[2],
    checksum: hashCode(sqlString),
  }
}

/**
 * Throws an error if any rows are written to migration_schema_history with success=false.
 *
 * This indicates the server DB could be in an invalid state and must be corrected before running the server.
 */
async function checkFailedMigrations(sql: SQL) {
  const fails = await sql.query<Migration[]>('SELECT * from ?? where success=?', [table, false])
  const failScripts = fails.map(f => 'V' + f.version)
  assert.equal(0, fails.length, `[db] detected failed migrations: ${failScripts}. Resolve and restart server.`)
}

/**
 * Throws an error if any success rows written to migration_schema_history do not match the corresponding file checksum (or the file is missing).
 *
 * This indicates that you have modified a .sql migration file after it's been run on the server.
 */
function checkSuccessfulMigrations(successes: Migration[], migrations: MigrationInput[]) {
  let lastRank = 0
  for (let i = 0; i < successes.length; i++) {
    const success = successes[i]
    check(
      migrations[i],
      `[db] migration V${success.version} was run successfully but no file found in db/migrations -- did you delete it?`
    )

    const migration = migrations[i]
    assert.equal(
      success.checksum,
      migration.checksum,
      `[db] migration V${success.version} was run successfully but the file checksum doesn't match -- was it modified?`
    )

    lastRank = success.installed_rank
  }
  return lastRank
}

/**
 * Runs the migration in a transaction. Does rollback if the migration fails.
 *
 * The currRank property should be the last successfully run migration rank.
 *
 * Records the execution of the migration (success/failure, total exec time) in the migration_schema_history table at rank=currRank+1.
 */
async function runMigration(migration: MigrationInput, currRank: number, sql: SQL) {
  const start = new Date()
  let end: Date
  let success = false

  const { sqlString, ...input } = migration

  try {
    console.log(`[db] running migration ${migration.version}: ${migration.description}...`)
    await transaction(s => s.query(sqlString))
    console.log(`[db] migration succeeded`)
    end = new Date()
    success = true
  } catch (e) {
    console.log(`[db] MIGRATION FAILED!!!`)
    console.error(e)
    end = new Date()
  }

  const row: Migration = {
    ...input,
    installed_rank: currRank + 1,
    installed_by: Config.appserverTag,
    execution_time: end.getTime() - start.getTime(),
    success,
  }

  try {
    await sql.insertAutoId(table, row)
  } catch (e) {
    // this will rollback the transaction wrapped around lockTable
    console.log('[db] error writing migration record, rolling back')
    throw e
  }
  return success
}
