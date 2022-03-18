import * as mongoose from 'mongoose';
import { getLogger } from 'log4js';

const logger = getLogger('orka.mongodb');

let connection: mongoose.Connection;

function mongodbUrl(config) {
  return config.mongodb && config.mongodb.url;
}

export default function mongodb(config, mongoOnConnected = () => undefined) {
  const dbUrl = mongodbUrl(config);
  if (!dbUrl) {
    return;
  }

  const options: mongoose.ConnectOptions = config.mongodb.options;

  mongoose.connect(dbUrl, options);
  connection = mongoose.connection;
  const db = mongoose.connection;

  db.on('connected', () => {
    logger.info(`Connected to mongodb! (${dbUrl.split('@')[1] || dbUrl})`);
    mongoOnConnected();
  });
  db.on('disconnected', () => logger.error('Mongodb disconnected'));
  db.on('reconnected', () => logger.info('MongoDB reconnected!'));
  db.on('error', function(err) {
    logger.error('unable to connect to database', err);
    throw err;
  });
}

export const getConnection = (
  err: () => any = () => {
    throw new Error('mongodb is not initialized');
  }
) => {
  if (!connection) {
    err();
  }
  return connection;
};
