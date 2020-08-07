const { orka, queueMetrics } = require('../../build');

const app = orka({
  diamorphosis: {
    configFolder: './examples/bull-example',
    logoPath: './examples/bull-example/logo.txt'
  }
});

app
  .initTasks()
  .then(() => {
    const config = require('./config');
    return queueMetrics(config.bull.metricsSchedule);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
