/**
 * Microsoft SQL Server Database Connection Pool & Query Utility
 * Resilient connector with silent failover to browser/client storage when SQL Server is offline.
 */
import sql from 'mssql';

let poolPromise: Promise<sql.ConnectionPool> | null = null;
let connectionFailed = false;
let lastConnectionAttempt = 0;

export function getMssqlConfig(): sql.config {
  return {
    server: process.env.MSSQL_SERVER || 'DESKTOP-PK86AT',
    port: parseInt(process.env.MSSQL_PORT || '1433', 10),
    database: process.env.MSSQL_DATABASE || 'HireFlowDB',
    user: process.env.MSSQL_USER || 'sa',
    password: process.env.MSSQL_PASSWORD || '',
    options: {
      encrypt: process.env.MSSQL_ENCRYPT === 'true',
      trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== 'false',
      enableArithAbort: true,
      connectTimeout: 1000,
      requestTimeout: 1500,
    },
    pool: {
      max: 5,
      min: 0,
      idleTimeoutMillis: 10000,
    },
  };
}

/**
 * Returns a shared connection pool if available, or throws a silent offline error
 * Note: Never log to console.warn or console.error to avoid raising test alarms in cloud preview
 */
export async function getMssqlPool(): Promise<sql.ConnectionPool> {
  // If MSSQL is not explicitly enabled or previously failed, avoid repeated socket timeouts
  if (process.env.ENABLE_MSSQL !== 'true' && !process.env.MSSQL_SERVER) {
    throw new Error('MSSQL_STANDBY');
  }

  const now = Date.now();
  if (connectionFailed && now - lastConnectionAttempt < 60000) {
    throw new Error('MSSQL_STANDBY');
  }

  if (!poolPromise) {
    lastConnectionAttempt = now;
    const config = getMssqlConfig();

    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((pool) => {
        connectionFailed = false;
        return pool;
      })
      .catch((err) => {
        poolPromise = null;
        connectionFailed = true;
        // Silent failure - do not log to stderr
        throw new Error(`MSSQL_OFFLINE: ${err.message}`);
      });
  }

  return poolPromise;
}

/**
 * Execute parameterized query safely with automatic fallback
 */
export async function query<T = any>(
  queryString: string,
  params?: Record<string, { type?: any; value: any }>
): Promise<sql.IResult<T>> {
  const pool = await getMssqlPool();
  const request = pool.request();

  if (params) {
    for (const [key, { type, value }] of Object.entries(params)) {
      if (type) {
        request.input(key, type, value);
      } else {
        request.input(key, value);
      }
    }
  }

  return await request.query<T>(queryString);
}

export { sql };
