'use strict';

const loggers = {};

//CONFIGURACION DE LOS LOGS PARA VERIFICACION DE ERRORES
loggers.insertLog = function (service, url, method, time1,  LogType1, message1, time2,  LogType2, message2, time3) {
    const service2 = global.nameServices[service].name;
    var time1 = (
        time1.getFullYear() + '-' + 
        ("0" + (time1.getMonth() + 1)).slice(-2) + '-' + 
        ("0" + (time1.getDate())).slice(-2) + ' ' +
        ("0" + time1.getHours()).slice(-2) + ':' +
        ("0" + time1.getMinutes()).slice(-2) + ':' +
        ("0" + time1.getSeconds()).slice(-2) + '.' +
        ("0" + time1.getMilliseconds()).slice(-3));
    var time2 = (
        time2.getFullYear() + '-' + 
            ("0" + (time2.getMonth() + 1)).slice(-2) + '-' + 
            ("0" + (time2.getDate())).slice(-2) + ' ' +
            ("0" + time2.getHours()).slice(-2) + ':' +
            ("0" + time2.getMinutes()).slice(-2) + ':' +
            ("0" + time2.getSeconds()).slice(-2) + '.' +
            ("0" + time2.getMilliseconds()).slice(-3));
    new Promise(() => {

        switch (global.nameServices[service].LogLevel) {
            case '0':
                break;
            case '1':
                loggerTrazabilidad(service2, url, method, time1, LogType1, message1, time2, LogType2, message2, time3);
                break;
            case '2':
                loggerAuditoria(service2, url, method, time1, LogType1, time2, LogType2, time3);
                break;
            case '3':
                if (LogType == 'Rq' || LogType == 'Rs') { loggerTrazabilidad(service2, url, method, time1, LogType1, message1, time2, LogType2, message2, time3); }
                if (LogType == 'Rq1' || LogType == 'Rs1') { loggerAuditoria(service2, url, method, time1, LogType1, time2, LogType2, time3); }
                break;
            default:
                loggerTrazabilidad(service2, url, method, time1, LogType1, message1, time2, LogType2, message2, time3);
                break;

        }
    });
};

function loggerTrazabilidad(service, url, method, time1, LogType1, message1, time2, LogType2, message2, time3) {
    console.log('DISPARADORES|'+ service + '|' + method + '|' + LogType1 + '|' + time1 + '|' + JSON.stringify(message1) + '|' + LogType2 + '|' + time2 +  '|' + JSON.stringify(message2) + '|' + time3);
    
}

function loggerAuditoria(service, url, method, time1, LogType1, time2, LogType2, time3) {
    console.log('[AUDIT] |DISPARADORES|' + service + '|' + method + '|' + LogType1 + '|' + time1 + '|' + LogType2 + '|' + time2 +  '|' + time3);

}

module.exports = loggers;