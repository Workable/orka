const {
  middlewares: { validateQueryString, validateBody, validateParams }
} = require('../../build');
const Joi = require('joi');

const schema = Joi.object().keys({
  keyString: Joi.string(),
  keyNumber: Joi.number(),
  keyBoolean: Joi.boolean(),
  keyStringArray: Joi.array().items(Joi.string())
});

const paramsSchema = Joi.object().keys({
  id: Joi.number().required(),
  name: Joi.string()
});

module.exports = {
  get: {
    '/testGet': [validateQueryString(schema), async (ctx, next) => (ctx.body = ctx.request.body)],
    '/testParams/:id/:name': [validateParams(paramsSchema), async (ctx, next) => (ctx.body = ctx.params)]
  },
  post: {
    '/testPost': [validateBody(schema), async (ctx, next) => (ctx.body = ctx.request.body)]
  }
};
