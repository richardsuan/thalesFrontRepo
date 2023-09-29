"use strict";

const https = require('https');

const app = require('./app/application');

const { initDatabase } = require("./app/common/database");
const { init } = require("./app/common/microservice.config");

const main = async () => {
  try {
    
    await initDatabase();
    await init();

    
    const privateKey = process.env.SSLKEY;
    const certificate = process.env.SSLCERT;

    const https_options = {
      key: privateKey,
      cert: certificate,
      passphrase: global.environment.ssl.passphrase,
    };

    https.createServer(https_options, app).listen(3000, () => console.log("Started, listening on port: " + 3000));
  } catch (error) {
    console.error(error);
  }
};


main();