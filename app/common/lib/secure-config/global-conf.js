const SecureConf = require('./secure-conf');
const sconf = new SecureConf();

//ARCHIVOS DE CONFIGURACION
const content = sconf.decryptContent(process.env.CONFIGPATH, process.env.SECURITY + '-C0rR3d0R_3mPr354R1al_WaLl3T');

if (content === undefined) {
    console.log("Error al desencriptar archivo configuracion");
} else {
    global.environment = JSON.parse(content).production;
    global.poolConfiguration = JSON.parse(process.env.POOLCONFIG);
}