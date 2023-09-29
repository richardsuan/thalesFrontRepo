'use strict';
const moment = require('moment');
const loggers = {};

// Configuración de logs para verificación de errores
// Metodo general para validar hacia que logger tiene que ir de acuerdo a la base de datos 
// console.log(global.nameServices);
loggers.insertLog = function(service, url, method, inputData, outputData) {

    const service2 = global.nameServices[service] != undefined ? global.nameServices[service].name : 'undefined';

    let time3 = outputData.time2.getTime() - inputData.time1.getTime();
      inputData.time1 = moment(inputData.time1).format('YYYY-MM-DD HH:mm:ss.SSS');
      outputData.time2 = moment(outputData.time2).format('YYYY-MM-DD HH:mm:ss.SSS');

    new Promise(() => {

        switch (global.nameServices[service] != undefined ? global.nameServices[service].LogLevel : 1) {
            case '1':
                loggerTrazabilidad(service2, url, method, inputData, outputData, time3);
                break;
            case '2':
                loggerAuditoria(service2, url, method, inputData, outputData, time3);
                break;
            case '3':
                if (LogType1 == 'Rq' || LogType2 == 'Rs') { loggerTrazabilidad(service2, url, method, inputData, outputData, time3); }
                if (LogType1 == 'Rq1' || LogType2 == 'Rs1') { loggerAuditoria(service2, url, method, inputData, outputData, time3); }
                break;
            default:
                loggerTrazabilidad(service2, url, method, inputData, outputData, time3);
                break;
        }
    }).catch(err => {
        console.log(err);
    });
};

function loggerTrazabilidad(service, url, method, inputData, outputData, time3) {
    console.log('|INSPIRED|' + service + '|' + method + '|' + url + '|' + inputData.LogType + '|' + inputData.time1 + '|' + JSON.stringify(inputData.message1) + '|' + outputData.LogType + '|' + outputData.time2 + '|' + JSON.stringify(outputData.message2) + '|' + time3);
}

function loggerAuditoria(service, url, method, inputData, outputData, time3) {
    console.log('[AUDIT] |INSPIRED|' + service + '|' + method + '|' + url + '|' + inputData.LogType + '|' + inputData.time1 + '|' + outputData.LogType + '|' + outputData.time2 + '|' + time3);
}

module.exports = loggers;