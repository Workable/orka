## Breaking Changes in v6

### Redis client upgraded from node-redis v3 to v6

`getRedis()` now returns a **promise-based** node-redis v6 client. The old callback-style API is gone.

**What changed:**
- `createRedisConnection()` is now `async` — callers must `await` it (or handle the returned promise) since orka now awaits the initial connection during boot before the server starts listening.
- `getRedis()`'s client no longer has callback-style methods — use `await redis.get('key')` instead of `redis.get('key', (err, val) => ...)`.
- `client.end()` is gone — use `client.destroy()` or `client.quit()`.
- Health check (`isHealthy()`) now reflects `client.isReady` instead of the removed `connected` property.
- If Redis is unreachable at boot, the app now still starts (previously the old retry_strategy could throw and crash the process) — `/health` reports unhealthy instead.

**What did *not* change:**
- `config.redis` schema is unchanged — `url`, `options.tls`, and the legacy retry/keepalive knobs (`timesConnected`, `totalRetryTime`, `reconnectAfterMultiplier`, `socketKeepalive`, `socketInitialDelay`) are still recognized and mapped internally to the new driver's `socket` options and reconnect strategy.
- Wire protocol reply shapes are preserved — orka pins `RESP: 2` by default. Set `config.redis.options.RESP = 3` to opt into RESP3 (node-redis v6's new default) if you're ready for the shape changes that come with it.
- Any other key under `config.redis.options` (e.g. `pingInterval`, `socket`) passes through to `createClient` unchanged.

**Migration steps for consumers:**
1. `await createRedisConnection(config)` wherever it's called directly (most consumers go through orka's boot sequence, which already awaits it).
2. Replace any callback-style Redis calls (`redis.get(key, cb)`) with `await`/promise usage (`await redis.get(key)`).
3. Replace `client.end()` calls with `client.destroy()`.
4. If you relied on `isHealthy()`/`connected`, no change needed — it's handled internally now via `isReady`.

See `README.md` → "Redis client (node-redis v6)" for full config details.

Full commit reference: `0362c9b` — "Migrate redis from v3 to v6".
