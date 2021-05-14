const { getLogger } = require('log4js');
const {
  middlewares: { health },
  getPostgresPool,
  withPostgresTransaction
} = require('../../build');

const logger = getLogger('[postgres-example]');

module.exports = {
  get: {
    '/health': health,
    '/now': async (ctx, next) => {
      const pool = getPostgresPool();
      const results = await pool.query('SELECT NOW() as now');
      ctx.body = results && results.rows;
      ctx.status = 200;
    },
    '/transaction': async (ctx, next) => {
      const transactionData = async c => {
        const res = await c.query('SELECT NOW() as now');
        logger.info(res && res.rows);
      };
      await withPostgresTransaction(transactionData);
      ctx.status = 200;
    }
  }
};
