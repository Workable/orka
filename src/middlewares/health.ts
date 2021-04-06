import { Context } from 'koa';
import { isHealthy } from '../initializers/rabbitmq';
import { isHealthy as checkRedisHealth } from '../initializers/redis';
import { isHealthy as checkKafkaHealth } from '../initializers/kafka/kafka';

export enum ConnectionStates {
  disconnected = 0,
  connected = 1,
  connecting = 2,
  disconnecting = 3,
  uninitialized = 99
}

export default async function (ctx: Context, next: () => Promise<null>) {
  const { getConnection } = await import('../initializers/mongodb');

  const OrkaBuilder = (await import('../orka-builder')).default;

  // tslint:disable-next-line: no-empty
  const mongoConnection = getConnection(() => {});
  // tslint:disable-next-line: no-empty
  const isRabbitHealthy = isHealthy();
  const isRedisHealthy = !OrkaBuilder.INSTANCE.config.healthCheck.redis || checkRedisHealth();
  const isKafkaHealthy = !OrkaBuilder.INSTANCE.config.healthCheck.kafka || (await checkKafkaHealth());
  if (
    (!mongoConnection || mongoConnection.readyState === ConnectionStates.connected) &&
    isRabbitHealthy &&
    isRedisHealthy &&
    isKafkaHealthy
  ) {
    ctx.status = 200;
    ctx.body = {
      env: OrkaBuilder.INSTANCE.config.nodeEnv,
      version: process.env.DD_VERSION || `v${process.env.npm_package_version}`
    };
  } else {
    ctx.status = 503;
  }
  await next();
}
