import * as Joi from '@hapi/joi';
import { ValidationError } from '../errors/validation-error';
import * as Koa from 'koa';

function validate(body: any, schema: Joi.ObjectSchema) {
  const result = schema.validate(body, { abortEarly: false });
  const error = result && result.error;
  if (error) {
    const msg =
      error.details &&
      error.details.reduce(
        (agg: any, { context: { key = '' } = {}, message = '' }: any) => ({ ...agg, [key]: message }),
        {}
      );
    throw new ValidationError(msg || { error: error.message }, 400, true);
  }
  return result;
}

export function validateBody(schema: Joi.ObjectSchema) {
  return async (ctx: Koa.Context, next: any) => {
    const result = validate(ctx.request.body, schema);
    ctx.request.body = result.value;
    await next();
  };
}

export function validateQueryString(schema: Joi.ObjectSchema) {
  return async (ctx: Koa.Context, next: any) => {
    // TODO: add the result of validate inside ctx in order to use it down the line
    validate(ctx.query, schema);
    await next();
  };
}
