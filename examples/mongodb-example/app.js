const { orka } = require("../../build");
const config = require("./config");

orka({
  beforeMiddleware: [
    async (ctx, next) => {
      ctx.body = "default body";
      await next();
    }
  ],
  diamorphosis: { configFolder: "./examples/mongodb-example" },
  routesPath: "./examples/mongodb-example/routes.js",
  logoPath: "./examples/simple-example/logo.txt",
  beforeStart: () => console.log(`Going to start env: ${config.nodeEnv}`)
}).start();
