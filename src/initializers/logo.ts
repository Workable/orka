import { getLogger } from './log4js';
import * as fs from 'fs';

const logger = getLogger('orka.logo');

export default function(config, pathToLogo) {
  if (config.printLogo) {
    try {
      let file = fs.readFileSync(pathToLogo);
      const lines = file.toString().split('/n');
      for (let line of lines) {
        console.log(line);
      }
    } catch (e) {
      logger.warn(`No logo found in path ${pathToLogo}`);
    }
  }
}
