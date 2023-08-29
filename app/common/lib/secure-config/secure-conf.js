'use strict'

//ARCHIVOS DE CONFIGURACION
var SecureConf = function (options) {
    options = options || {};
    this.options = {
        aes: 'aes-256-cbc',
        file: {
            encoding: 'utf8',
            out_text: 'hex'
        }
    };
    this.options.aes = options.aes ? options.aes : this.options.aes;
    this.options.file.encoding = options.file_encoding ? options.file_encoding : this.options.file.encoding;
    this.options.file.out_text = options.file_out_text ? options.file_out_text : this.options.file.out_text;

    this.crypto = require('crypto');
    

    this.InvalidArgumentException = function InvalidArgumentException(message) {
        this.message = message;
        this.name = "InvalidArgumentException";
    }
};

//ARCHIVOS DE CONFIGURACION
SecureConf.prototype.decryptContent = function (content, pass) {
    var self = this, decipher, decrypted;
    try {
        decipher = self.crypto.createDecipher(self.options.aes, pass);
        decrypted = decipher.update(content, self.options.file.out_text, self.options.file.encoding);
        decrypted += decipher.final(self.options.file.encoding);
    } catch (ex) {
    }
    return decrypted;
};

module.exports = SecureConf;