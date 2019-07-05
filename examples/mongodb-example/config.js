module.exports = {
  nodeEnv: 'demo',
  port: 3210,

  mongodb: {
    url: 'mongodb://localhost/orka',
    // mongoose options for tuning mongodb.
    // Details: https://mongoosejs.com/docs/connections.html
    options: {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    }
  }
};
