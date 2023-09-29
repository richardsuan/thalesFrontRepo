"use strict";

const jwt = require('jsonwebtoken');

// Variables certificado
const privateKEY = process.env.AUTHKEY;
const publicKEY = process.env.AUTHCERT;
const passphrase = global.environment.auth.passphrase;
const algorithm = 'RS256';


// Firmar token de autenticacion
const signAuth = async (payload) => {  
    //Opciones de ingreso
    const signOptions = {
      expiresIn: global.configMicroservices.token.authenticationExpiresIn.VALOR,
      algorithm: algorithm
  };

  const secret = { key: privateKEY, passphrase };

  const tokenJwt = jwt.sign(payload, secret, signOptions);    
  return tokenJwt;
};


const verifyAuth = async (token) => {
  if (global.configMicroservices === undefined){
    return { status: 0, error: 'global.configMicroservices undefined', message: 'Parameters not found to verify authentication' };
  }

  // Opciones de verificacion
  const verifyOptions = {
    expiresIn: global.configMicroservices.token.authenticationExpiresIn.VALOR,
    algorithm: [algorithm]
  };

  return jwt.verify(token, publicKEY, verifyOptions, (err, decoded) => {
    if (err){
      // console.log({ status: 0, error: err, message: 'Unauthorized. The provided player session token is invalid or it has expired.' });
      return { status: 0, error: err, message: 'Unauthorized. The provided player session token is invalid or it has expired.' };
    } else {
      // console.log({ status: 1, data: decoded });
      return { status: 1, data: decoded };
    }
  });
};



module.exports = { signAuth, verifyAuth };