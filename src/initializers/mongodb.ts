import * as mongoose from 'mongoose';
import { getLogger } from 'log4js';

const logger = getLogger('orka.mongodb');

let db: mongoose.Connection;

function mongodbUrl(config) {
  return config.mongodb && config.mongodb.url;
}

export default function mongodb(config) {
  if (db) {
    return;
  }
  const dbUrl = mongodbUrl(config); 
  if (!dbUrl) {
    // TODO: error?
    return;
  }

  const options: mongoose.ConnectionOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  };
  
  mongoose.connect(dbUrl, options);
  db = mongoose.connection;
  
  db.on('connected', () => logger.info(`Connected to mongodb! (${dbUrl.split('@')[1] || dbUrl})`));
  db.on('disconnected', () => logger.error('Mongodb disconnected'));
  db.on('reconnected', () => logger.info('MongoDB reconnected!'));
  db.on('error', function(err) {
    logger.error('unable to connect to database', err);
    throw err;
  });
};

export const getMongoDB = () => db;
