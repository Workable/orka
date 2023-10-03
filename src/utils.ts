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

export function appendHeadersFromStore(properties: any, store: Map<string, any>, config: any) {
  if (!config.requestContext.enabled) return;
  if (!config.requestContext.propagatedHeaders.enabled) return;
  properties.headers = properties.headers || {};

  const headers = store?.get('propagatedHeaders');
  if (!headers) return;

  headers['x-depth'] = parseInt(headers['x-depth'] || 0, 10) + 1;
  const traceHeaderName = config.traceHeaderName.toLowerCase();

  if (headers['x-depth'] % 2 === 0) {
    if (!headers['x-initiator-id'] && headers['x-parent-id']) headers['x-initiator-id'] = headers['x-parent-id'];
    headers['x-parent-id'] = headers[traceHeaderName];
    headers[traceHeaderName] = `orka:${randomUUID()}`;
  }

  Object.keys(headers).forEach(key => {
    properties.headers[key] = properties.headers[key] ?? headers[key];
  });
}

export function appendToStore(store, properties, config) {
  if (!config.requestContext.enabled) return;
  if (!config.requestContext.propagatedHeaders.enabled) return;
  if (!properties?.headers) return;

  const propagatedHeaders = pick(properties.headers, config.requestContext.propagatedHeaders.headers);
  store.set('propagatedHeaders', propagatedHeaders);
}
