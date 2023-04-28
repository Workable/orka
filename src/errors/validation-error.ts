import { CustomError } from './custom-error';

export class ValidationError extends CustomError {
  public exposedMsg: object;
  constructor(msg: object, public status: number, public expose?: boolean, public blacklist?: boolean) {
    super(JSON.stringify(msg));
    this.exposedMsg = msg;
  }
}
