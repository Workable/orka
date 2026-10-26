import { Context } from 'koa';

const contentEncodingHeader = 'content-encoding';

const hasBrotliEncoding = (value: string | string[] | undefined): boolean => {
  if (!value || value.length === 0) return false;
  const raw = Array.isArray(value) ? value.join(',') : value;
  return raw.split(',').some(part => part.trim().toLowerCase() === 'br');
};

export default async function rejectBrotliEncoding(ctx: Context, next: () => Promise<any>) {
  const encoding = ctx.request.headers[contentEncodingHeader];
  if (hasBrotliEncoding(encoding)) {
    ctx.status = 415;
    return;
  }
  await next();
}
