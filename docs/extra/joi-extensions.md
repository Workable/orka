---
layout: default
title: Joi Extensions
parent: Extra
nav_order: 3
---

# Joi Extensions
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
  {:toc}

Orka is exposing a useful list of Joi extensions to be used in your application.

## Usage

You can simply import the extended Joi module in your application

```js
import { Joi } from '@workablehr/orka';
```

and then use the available extensions

e.g.
```js
const schema = {
  id: Joi.objectId(),
  color: Joi.hexColor()
};

```
## Extensions
Below you can see all the available extensions

### Joi.booleanWithEmpty()
Validates a boolean value and allows empty strings or null

### Joi.dateInThePast()
Validates that the provided value is a date the past

### Joi.hexColor()
Validates that the provided value is a hex color

### Joi.objectId()
Validates that the provided value is an objectId (mongoDB)

### Joi.phone()
Validates that the provided value is a valid phone number.

If you can provide the rule `stripIfInvalid` to strip the value instead of creating an error.

e.g.
```js
const schema = {
  phone: Joi.phone().stripIfInvalid()
};
```

P.S The regex `/^[\d\s\(\)\-\+–\.]+$/` is used for phone validation.

### Joi.safeHtml()
Validates and transforms a value to a safeHtml string by using the following code. It supports `allowedTags` & `allowedAttributes` rules.

e.g.
```js
const schema = {
  html: Joi
    .safeHtml()
    .allowedTags(['a'])
    .allowedAttributes({
      a: ['href', 'class']
    })
};
```

It defaults to:
```js
const allowedTags = ['b', 'i', 'u', 'span', 'p', 'div', 'a', 'font'];
const allowedAttributes = {
  a: ['href', 'target', 'rel'],
  font: ['color']
};
```

### Joi.string()
Validates that the provided value is a string. It clears the `null` byte from strings

### Joi.stringWithEmpty()
Validates that the provided value is a string and allows empty strings or null. It clears the `null` byte from strings

### Joi.urlInOwnS3()
Validates that the provided value is an valid url in the provided S3 bucket. You can also provide an option to return error if the S3 url provided is expired or not

e.g.
```js
const schema = {
  url: Joi.urlInOwnS3().bucket('bucket-name').errorOnExpiredUrl(),
};
```

### Joi.url()
Validates that the provided value is an valid url with 2 segments minumum

### Joi.urlWithEmpty()
Validates that the provided value is an valid url with 2 segments minumum. It allows empty strings or null
