const { orka, getLogger } = require('../../build');

const app = orka({
  diamorphosis: {
    configFolder: './examples/bull-example'
  }
});

// This is only needed if you want to use Orka services in your processor
app
  .initTasks()
  .then(() => {
    getLogger('sandboxed-handler').info(`started with Pid: ${process.pid}`);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

module.exports = async job => {
  const { id, data } = job;
  getLogger(`queue_two:${process.pid}`).info(`Processing job #${id}`);
  getLogger(`queue_two:${process.pid}`).info({ id, data });
  // Do some async processing of the job here...';
};
