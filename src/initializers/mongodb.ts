import * as mongoose from 'mongoose';
import { getLogger } from 'log4js';
import * as lodash from 'lodash';

const logger = getLogger('orka.mongodb');

function mongodbUrl(config) {
  return config.mongodb && config.mongodb.url;
}

export default function mongodb(config) {
  const dbUrl = mongodbUrl(config);
  if (!dbUrl) {
    return;
  }

  const options: mongoose.ConnectionOptions = lodash.defaultsDeep(config.mongodb.options, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: false
  });

  mongoose.connect(dbUrl, options);
  const db = mongoose.connection;

  db.on('connected', () => logger.info(`Connected to mongodb! (${dbUrl.split('@')[1] || dbUrl})`));
  db.on('disconnected', () => logger.error('Mongodb disconnected'));
  db.on('reconnected', () => logger.info('MongoDB reconnected!'));
  db.on('error', function(err) {
    logger.error('unable to connect to database', err);
    throw err;
  });
}
