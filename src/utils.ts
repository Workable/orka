const regex = /^v(\d+)\.(\d+)\.(\d+)$/;

export const alsSupported = () =>
  nodeVersionGreaterThanEqual('v12.17.0') ||
  nodeVersionGreaterThanEqual('v13.14.0') ||
  nodeVersionGreaterThanEqual('v14.0.0');

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
