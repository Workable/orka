const {
  middlewares: { validateQueryString, validateBody }
} = require('../../build');
const Joi = require('joi');

const schema = Joi.object().keys({
  keyString: Joi.string(),
  keyNumber: Joi.number(),
  keyBoolean: Joi.boolean(),
  keyStringArray: Joi.array().items(Joi.string())
});

module.exports = {
  get: {
    '/testGet': [validateQueryString(schema), async (ctx, next) => (ctx.body = ctx.request.body)]
  },
  post: {
    '/testPost': [validateBody(schema), async (ctx, next) => (ctx.body = ctx.request.body)]
  }
};
