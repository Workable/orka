import options from '../default-options';
import { Middleware } from 'koa-compose';
declare type OrkaOptions = typeof options;
declare type ReturnsMiddleware<T> = (config) => Middleware<T>;
