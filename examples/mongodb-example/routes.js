const User = require("./user");

module.exports = {
  get: {
    "/users": async (ctx, next) => {
      ctx.body = await User.find();
    }
  }
};
