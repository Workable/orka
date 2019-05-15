import Orka from './orka';

export { getLogger } from './initializers/log4js';
export const orka = config => new Orka(config);
