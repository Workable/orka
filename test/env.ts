process.env.TS_NODE_PROJECT = './test/tsconfig.json';
process.env.LOG_LEVEL = 'fatal';
process.env.PRINTLOGO = 'false';
process.env.NODE_ENV = 'test';
process.env.RIVIERE_ENABLED = 'false';
// Makes running tests a lot faster and less resource consuming
process.env.TS_NODE_TRANSPILE_ONLY = 'true';
