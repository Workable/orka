import { randomUUID } from 'crypto';
import { pick } from 'lodash';

const regex = /^v(\d+)\.(\d+)\.(\d+)$/;

export const nodeVersionGreaterThanEqual = (requestedVersion: string, version = process.version) => {
  const [, major, minor, patch] = version.match(regex).map((n: string) => parseInt(n, 10));
  const [, requestedMajor, requestedMinor, requestedPatch] = requestedVersion
    .match(regex)
    .map((n: string) => parseInt(n, 10));

  if (major > requestedMajor) return true;
  if (major < requestedMajor) return false;

  // Equal major
  if (minor > requestedMinor) return true;
  if (minor < requestedMinor) return false;

  // Equal minor
  if (patch > requestedPatch) return true;
  if (patch < requestedPatch) return false;

  // Equal patch
  return true;
};

export function appendHeadersFromStore(
  properties: { headers?: Record<string, string | Buffer | (Buffer | string)[] | undefined> },
  store: Map<string, string | Record<string, string>>,
  config: Record<string, any>
) {
  if (!config.requestContext.enabled) return;
  if (!config.requestContext.propagatedHeaders.enabled) return;
  properties.headers = properties.headers || {};

  const headers = store?.get('propagatedHeaders');
  if (!headers) return;

  const depth = parseInt(headers['x-depth'] || 0, 10) + 1;
  const traceHeaderName = config.traceHeaderName.toLowerCase();

  if (depth % 2 === 0 && headers[traceHeaderName]) {
    if (!headers['x-initiator-id'] && headers['x-parent-id']) {
      properties.headers['x-initiator-id'] = properties.headers['x-initiator-id'] ?? headers['x-parent-id'];
    }
    properties.headers['x-parent-id'] = headers[traceHeaderName];
    properties.headers[traceHeaderName] = `orka:${randomUUID()}`;
  }

  Object.keys(headers).forEach(key => {
    properties.headers[key] = properties.headers[key] ?? headers[key];
  });
  properties.headers['x-depth'] = depth.toString();
}

export function appendToStore(
  store: Map<string, string | Record<string, string | string[]>>,
  properties: { headers?: Record<string, string | string[]> },
  config: Record<string, any>
) {
  if (!config.requestContext.enabled) return;
  if (!config.requestContext.propagatedHeaders.enabled) return;
  if (!properties?.headers) return;

  const propagatedHeaders = pick(properties.headers, config.requestContext.propagatedHeaders.headers);
  store.set('propagatedHeaders', propagatedHeaders);
}
