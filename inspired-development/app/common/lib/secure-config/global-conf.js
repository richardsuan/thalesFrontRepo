'use strict';

const { SecureConf } = require('./secure-conf');

const sconf = new SecureConf();

// Informacion de configuracion

const content = sconf.decryptContent(process.env.CONFIGPATH, process.env.SECURITY + '-C0rR3d0R_3mPr354R1al_WaLl3T');

if (content !== undefined) {
  global.environment = JSON.parse(content).production;
  global.poolConfiguration = JSON.parse(process.env.POOLCONFIG);
}
