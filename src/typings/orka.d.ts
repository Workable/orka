import options from '../default-options';
import OrkaBuilder from '../orka-builder';

declare type OrkaOptions = typeof options & { builder?: OrkaBuilder };
