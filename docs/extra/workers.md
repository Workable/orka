---
layout: default
title: Workers
parent: Extra
nav_order: 1
---

# Workers
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
  {:toc}

Orka is exposing a useful factory to create workers. This is a convenient boilerplate code to execute long running tasks keeping some state in a mongodb collection.
Sometimes you need to execute long running tasks that need to continue from where it had left off when being restarted. E.g. Processing some million of rows in a table and keeping the last processed row.
Orka's worker will automatically create and use a mongo collection called workerjob for this.

## Installation

To use the build in worker you need to have mongodb configured. See [mongodb](https://workable.github.io/orka/integrations/mongodb)

### Configuration

```js
// config/config.js
module.exports = {
  workers: {
    retryDelay: 1000 * 60 * 60, // 1 hour
    initializationCheckDelay: 1000 // 1 min
  }
};
```

### Usage

```js
const o = orka({});

const worker = o.createWorker('example-worker');

worker.start(initialize, execute);

// once this is completed, model will be set to initialized=true so that it won't run again
async function initialize(job, logger) {
  job.payload = { progress: 0 };
}

// once this is completed, model will be set to finished=true so that it won't run again
async function execute(job, logger) {
  const progress = job.payload.progress;
  for (let i = progress + 1; i < 100; i++) {
    await worker.WorkerJob.findOneAndUpdate({ _id: job._id }, { $set: { payload: { progress: i } } });
    logger.info('setting progress to ', i);
    await new Promise(r => setTimeout(r, 100));
  }
}
```

### WorkerJob schema

```js
const schema = {
  payload: any; // to keep the progress
  name: string;
  initialized: boolean;
  finished: boolean;
}
```

### Errors

When errors occur worker will be restarted in config.workers.initializationCheckDelay ms

### After execution is finished

If worker is finished and the process runs again the worker will poll every config.workers.retryDelay the collection to see if something has changed.
