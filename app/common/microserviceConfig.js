'use strict';

const database = require('../common/database');
const oracledb = require('oracledb');
const parameters = {};

//Confiracion inicial que viene de la base de datos
parameters.configInitial = function() {
    return getParameters().then(rows => {

        function getParameter(value) {
            try {
                return (rows.filter(function(item) {
                    return (item.CODIGO == value);
                }))[0].VALOR;
            } catch (e) {
                return null;
            }
        }

        global.configMicroservices = {
            password: {
                expiration: getParameter(1) || '0',
                regex: getParameter(2) || '0'
            },
            token: {
                activateAccountExpiresIn: getParameter(4) || '24h',
                authenticationExpiresIn: getParameter(5) || '4h'
            },
            timeFront: getParameter(168),
            urlBonusKambiService: getParameter(106),
            certKambi: process.env.CERTCORREDORKAMBI,
            keyKamni: process.env.NOPASSKEYKAMBI,
            ftpConfig: {
                ht: getParameter(190),
                user: getParameter(191),
                port: getParameter(192),
                pass: getParameter(193),
                path: getParameter(194),
                pathMarketing: getParameter(221)
            }
        };

        return;
    });
};

//Funcion que trae los datos de la base de datos en la tabla parametros
function getParameters() {
    const sql = 'BEGIN GET_PARAMETERS(:result); END;';
    const parameters = {
        result: {
            dir: oracledb.BIND_OUT,
            type: oracledb.CURSOR
        }
    };
    return database.getConnection().then(connection => {
        return database.executeQuery(connection, sql, parameters, true).then(result => {
            return database.fetchRowsFromCursor(result.outBinds.result).then(rows => {
                database.closeConnection(connection);
                return rows;
            });
        });
    });
}

parameters.configInitialLog = function() {
    return getParametersLogs().then(rows => {
        function getParameterLog(value) {
            try {
                return (rows.filter(function(item) {
                    return (item.ID_PARAMLOG == value)
                }))[0].VALOR;
            } catch (e) {
                return null;
            }
        }
        global.nameServices = [{
                LogCode: 0,
                name: 'sendTarjetaSisred',
                LogLevel: getParameterLog(1)
            },{
                LogCode: 1,
                name: 'assignTarjetaSisred',
                LogLevel: getParameterLog(1)
            },{
                LogCode: 2,
                name: 'postRewardtemplate',
                LogLevel: getParameterLog(1)
            },{
                LogCode: 3,
                name: 'postBonusProgram',
                LogLevel: getParameterLog(1)
            },{
                LogCode: 4,
                name: 'batch-kambi',
                LogLevel: getParameterLog(1)
            },{
                LogCode: 5,
                name: 'batchSMSBlipBlip-blipblip',
                LogLevel: getParameterLog(1)
            },{
                LogCode: 6,
                name: 'sendKambi',
                LogLevel: getParameterLog(1)
            }
        ];
    })
}

function getParametersLogs() {
    const sql = 'BEGIN GET_PARAMETERS_LOGS(:p_id_proveedor, :result); END;';
    const parameters = {
        p_id_proveedor: 18,
        result: {
            dir: oracledb.BIND_OUT,
            type: oracledb.CURSOR
        }
    };
    return database.getConnection().then(connection => {
        return database.executeQuery(connection, sql, parameters, true).then(result => {
            return database.fetchRowsFromCursor(result.outBinds.result).then(rows => {
                database.closeConnection(connection);
                return rows;
            });
        });
    });
}
module.exports = parameters;