---
layout: default
title: Get Lock
parent: Extra
nav_order: 2
---

# Axios Response Interceptor

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
   {:toc}

Orka provides a helper utility to aqcuire a lock during asynchronous operations.

### Usage

```js
const { helpers } = '@workablehr/orka';
const lock = helpers.getLock('update');
await doUpdate();
await moreAsyncWork();
lock.release();
```

This is espcecially useful when some shared state is needed between the async operations and no other flow should change this state.


