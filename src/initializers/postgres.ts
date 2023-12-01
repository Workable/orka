import requireInjected from '../require-injected';
import { getLogger } from 'log4js';
import type * as PgTypes from 'pg';
import { isEmpty } from 'lodash';

let pool: PgTypes.Pool;

export default function postgres(config) {
  const logger = getLogger('orka.postgres');
  if (config.postgres?.url && !pool) {
    const { Pool }: typeof PgTypes = requireInjected('pg');
    const pgConfig = config.postgres;

    if (isEmpty(pgConfig.sslConfig?.ca)) delete pgConfig.sslConfig?.ca;
    if (isEmpty(pgConfig.sslConfig?.cert)) delete pgConfig.sslConfig?.cert;
    if (isEmpty(pgConfig.sslConfig?.key)) delete pgConfig.sslConfig?.key;

    pool = new Pool({
      connectionString: pgConfig.url,
      max: pgConfig.poolSize,
      ssl: pgConfig.useSsl ? pgConfig.sslConfig : undefined,
      idleTimeoutMillis: pgConfig.idleTimeoutMillis,
      connectionTimeoutMillis: pgConfig.connectionTimeoutMillis
    });
    logger.info(`Connected to Postgres! (${pgConfig.url.split('@')[1] || pgConfig.url})`);
    pool.on('error', err => {
      logger.error('Unable to connect to database', err);
      throw err;
    });
  }
}

/**
 * Returns the Postgres pool to execute a query.
 * If you choose to run `client = await pool.connect()` you should ALWAYS release
 * the client using `client.release()` after finishing your operations
 */
export const getPostgresPool = () => {
  if (!pool) {
    throw new Error('postgres is not initialized');
  }
  return pool;
};

/**
 * A wrapper for Postgres transactions that eventually always releases the client
 */
export const withPostgresTransaction = async (cb: (client: PgTypes.PoolClient) => Promise<any>) => {
  if (!pool) {
    throw new Error('postgres is not initialized');
  }
  if (!cb) {
    throw new Error('callback is not defined');
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await cb(client);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};
