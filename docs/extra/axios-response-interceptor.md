---
layout: default
title: Axios Response Interceptor
parent: Extra
nav_order: 2
---

# Axios Response Interceptor
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
  {:toc}

Orka provides the ability to intercept responses of applications that use axios, via the usage of [axios interceptors](https://axios-http.com/docs/interceptors). 
In this manner, it is possible to properly propagate an error thrown by axios using its respective status code, instead of manually catching these errors
and explicitly specifying the status code.

### Usage

```js
const { helpers } = ('@workablehr/orka');
const o = orka({}).with(helpers.axiosErrorInterceptor);
```

Having done that, when the application calls another service and receives an error from axios (e.g., a 404) and left unhandled, the application will finally throw a 404. 

## Future work

This functionality can be further extended in order to support interceptors for requests too. 