import * as tmp from 'tmp';
import * as fs from 'fs';
import { getLogger } from 'log4js';

const logger = getLogger('kafka.auth');

const certificates = ({ key, cert, ca }) => {
  const tmpKey = tmp.fileSync();
  const tmpCert = tmp.fileSync();
  const tmpCa = tmp.fileSync();
  fs.writeFileSync(tmpKey.name, key);
  fs.writeFileSync(tmpCert.name, cert);
  fs.writeFileSync(tmpCa.name, ca);
  const paths = {
    key: tmpKey.name,
    cert: tmpCert.name,
    ca: tmpCa.name
  };
  logger.trace('Certificates created: ', paths);
  return paths;
};

export default ({
  key,
  cert,
  ca,
  username,
  password
}: {
  key?: string;
  cert?: string;
  ca?: string;
  username?: string;
  password?: string;
}) => {
  if (key && cert && ca) {
    const paths = certificates({ key, cert, ca });

    return {
      'security.protocol': 'ssl',
      'ssl.key.location': paths.key,
      'ssl.certificate.location': paths.cert,
      'ssl.ca.location': paths.ca
    };
  } else if (username && password) {
    return {
      'security.protocol': 'sasl_ssl',
      'sasl.mechanism': 'PLAIN',
      'sasl.username': username,
      'sasl.password': password
    };
  }

  return {};
};
