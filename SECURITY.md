# Security Policy

## Reporting a Vulnerability

Please report security vulnerabilities via GitHub's
[Private vulnerability reporting](https://github.com/Workable/orka/security/advisories/new).

Do not open public GitHub issues for security reports.

## Temporary Dependency Overrides

Some transitive dependencies are pinned via `overrides` in `package.json` because upstream
packages have not yet published fixes. Review these whenever Dependabot opens PRs that
touch the listed parent packages.

| Override | Reason | Remove when |
|----------|--------|-------------|
| `serialize-javascript` → `^7.0.5` | `mocha` still resolves to a vulnerable 6.x release | `npm ls serialize-javascript` shows `>= 7.0.5` without the override |
| `rabbit-queue.uuid` → `^11.1.1` | `rabbit-queue` pins `~8.3.2` | `npm view rabbit-queue dependencies` no longer pins `uuid@8.x` |
| `mocha.js-yaml` → `^4.2.0` | `mocha` allows `js-yaml@4.1.x` | `npm ls js-yaml` under `mocha` shows `>= 4.2.0` without the override |
| `mocha.minimatch` → `9.0.7` | `mocha` resolves to a vulnerable 9.0.5 | `npm ls minimatch` under `mocha` shows `>= 9.0.7` without the override |
| `tslint.js-yaml` → `3.15.0` | `tslint` pulls a vulnerable `js-yaml@3.14.x` | `tslint` is removed or its dependency chain resolves to `>= 3.15.0` |
| `tslint.minimatch` → `3.1.5` | `tslint` pulls a vulnerable `minimatch@3.1.2` | `tslint` is removed or its dependency chain resolves to a patched version |
| `cosmiconfig.js-yaml` → `3.15.0` | `husky@3` pulls a vulnerable `js-yaml@3.14.x` | `husky` is upgraded or its dependency chain resolves to `>= 3.15.0` |
| `@istanbuljs/load-nyc-config.js-yaml` → `3.15.0` | `nyc` pulls a vulnerable `js-yaml@3.14.x` | `npm ls js-yaml` under `nyc` shows `>= 3.15.0` without the override |

To test whether an override can be removed, delete it from `package.json`, run
`npm install && npm audit`, and confirm CI passes.
