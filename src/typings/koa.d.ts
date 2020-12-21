import { IncomingMessage } from 'http';

declare module 'koa' {
  interface Context {
    req: IncomingMessage & { _datadog: { span: { setTag: (name: string, value: string) => void } } };
  }
}
