'use strict';

const loggerManagement = require('./logger');
const responses = {};
//RESPUESTA A LOS ESTADOS DESDE LA BASE DE DATOS
responses.customResponse = function (response, time1, method, service, url, message1, LogType1, time2,message2,LogType2, code, time3) {
    loggerManagement.insertLog(service, url, method, time1, LogType1, message1, time2, LogType2, { codigo: code, res: message2 }, time3); //generar log
    return response.status(code).send(message2);
};

//ERROR DE AUTENTICACION(CUANDO EL TOKEN FUE CAMBIADO)
responses.authErrorResponse = function (response, time1, method, service, url, message1, LogType1, time2,message2,LogType2, time3, messageResponse = 'Unauthorized. The provided player session token is invalid or it has expired.') {
    loggerManagement.insertLog( service, url, method, time1, LogType1, message1, time2, LogType2,{ codigo: '401', res: message2 }, time3); //generar log
    return response.status(401).send({
        'message': messageResponse
    });
};

//ERROR POR DATA MALFORMADA O VACIA 
//responses.dataErrorResponse2 = function (response, time, method, service, url, message, LogType)  {
responses.dataErrorResponse = function (response, time1, method, service, url, message1, LogType1, time2,message2,LogType2, time3)  {
    loggerManagement.insertLog(service, url, method, time1,  LogType1, message1, time2, LogType2,{ codigo: '422', res: message2 }, time3); //generar log
    return response.status(422).send(message2);
};

//ERROR EN LOS SERVIDORES
//responses.serverErrorResponse2 = function (response, time, method, service, url, message, LogType, messageResponse = 'Internal server error' ) {
responses.serverErrorResponse = function (response, time1, method, service, url, message1, LogType1, time2,message2,LogType2, time3, messageResponse = 'Internal server error' ) {
    loggerManagement.insertLog(service, url, method, time1, LogType1, message1, time2, LogType2, { codigo: '500', message: message2 }, time3); //generar log
    return response.status(500).send({
        'message': messageResponse
    });
};
module.exports = responses;