import Orka from './orka';
export {default as builder } from './builder';
export { getLogger } from './initializers/log4js';
export const orka = config => Orka(config);
