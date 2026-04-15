import { Context, Next, Middleware } from 'koa';
import * as qs from 'qs';

const defaultQueryParserOptions = {
  arrayLimit: 1000,
  parameterLimit: 1000,
  depth: 5
};

export default function parseQuerystring(config: { queryParser?: qs.IParseOptions } = {}): Middleware {
  const options: qs.IParseOptions = {
    ...defaultQueryParserOptions,
    ...config.queryParser
  };

  return async function parseQuerystringMiddleware(ctx: Context, next: Next) {
    if (ctx.querystring) {
      let query;
      Object.defineProperty(ctx.state, 'query', {
        get() {
          return query || qs.parse(ctx.querystring, options);
        },
        set(v) {
          query = v;
        }
      });
    }
    return next();
  };
}
