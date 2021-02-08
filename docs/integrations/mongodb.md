---
layout: default
title: MongoDB
parent: Integrations
nav_order: 2
---

# Mongodb

Orka uses [mongoose](https://mongoosejs.com/).

It will connect to mongodb automatically if a connection url is given.

eg:

`MONGODB_URL={url} node app.js`

## Usage

```js
//config/config.js

module.exports = {
  mongodb: {
    url: 'mongodb://localhost/orka' // to be used in development
  }
};
```

```js
//app/models/model.js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ModelScham = new Schema(
  {
    key: { type: String, unique: true },
    ...
  },
  {
    timestamps: {}
  }
);

module.exports = mongoose.model('Model', ModelScham);
```

You use mongoose as you would without worrying about connection initilization.
