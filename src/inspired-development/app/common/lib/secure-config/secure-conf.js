"use strict";

const crypto = require("crypto");

// Archivo de configuracion

class SecureConf {
  constructor(options = {}) {
    this.options = {
      aes: options.aes || "aes-256-cbc",
      file: {
        encoding: "utf8",
        out_text: "hex",
        ...options.file
      },
    };
  }


  decryptContent(content, pass){
    let decrypted = null;
    
    try {
      const decipher = crypto.createDecipher(this.options.aes, pass);
      decrypted = decipher.update(content, this.options.file.out_text, this.options.file.encoding);
      decrypted += decipher.final(this.options.file.encoding);
    } catch (error) {
      console.log('Error al desencriptar el contenido');
      return undefined;
    }

    return decrypted;
  }

}


class InvalidArgumentException {
  constructor(message) {
    this.message = message;
    this.name = "InvalidArgumentException";
  }
}


module.exports = { SecureConf, InvalidArgumentException };
