const locks = {};
const resolves = {};

export default async function getLock(name) {
  let localLock;
  do {
    localLock = locks[name];
    // eslint-disable-next-line no-await-in-loop
    await locks[name];
    // More than one queues might be waiting to be created. Only one can pass this check.
  } while (locks[name] !== localLock);
  locks[name] = lock(name);

  return {
    release: () => {
      resolves[name]();
      delete locks[name];
      delete resolves[name];
    }
  };
}

function lock(name) {
  return new Promise(r => {
    resolves[name] = r;
  });
}
