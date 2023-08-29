---
layout: default
title: Growthbook
parent: Integrations
nav_order: 11
---

# GrowthBook
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Installation

`@growthbook/growthbook` is an optional dependency. In order to enable it you need to install it by giving it an **alias** as `growthbook`:

```sh
npm i growthbook@npm:@growthbook/growthbook
```

It will connect to growthbook automatically if a growthbook clientKey is provided.

eg:

`GROWTHBOOK_CLIENT_KEY={url} node app.js`

## Usage

```js
//config/config.js

module.exports = {
  growthbook: {
    clientKey: '1234'
  }
};
```

### getGrowthbook

You can call `getGrowthbook` to retrieve the existing growthbook instance. You can use a generic typing so you will have
autocompletion when using the `isOn` method

```ts
const { getGrowthbook } = require('@workablehr/orka');

const gb = getGrowthbook<{featureA: boolean}>();
await gb.loadFeatures();
if (gb.isOn('featureA')) {
  // Do stuff...
}
```
