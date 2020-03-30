export class CustomError extends Error {
  constructor(msg?: string) {
    super(msg);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
