import * as os from 'os';

export default {
  get: {
    '/health': async ctx => (ctx.status = 200),
    '/ping': async ctx => (ctx.status = 200),
    '/status': async ctx => {
      const mem = process.memoryUsage();
      const m = 1024 * 1024;

      ctx.body = {
        rss: (mem.rss / m).toFixed(2) + 'M',
        heapTotal: (mem.heapTotal / m).toFixed(2) + 'M',
        heapUsed: (mem.heapUsed / m).toFixed(2) + 'M',
        loadAvg: os.loadavg()
      };

      if (ctx.request.query.refresh) {
        ctx.set('Refresh', ctx.request.query.refresh);
      }
    }
  }
};
