const database = require('../common/database');
const oracledb = require('oracledb');
const axios = require('axios');
const https = require('https');
const loggerManagement = require('../common/logger');
const moment = require('moment');

const operations = {};

operations.postRewardtemplate = async(url, data) => {
    const body = {
        customerRef: data.customerRef,
        rewardTemplateId: data.rewardTemplateId,
    }

    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
        cert: global.configMicroservices.certKambi,
        key: global.configMicroservices.keyKamni,
        passphrase: global.environment.ssl.passphrase
    })

    return await axios.post(url, body, { httpsAgent }).then((result) => {
        return ({
            'code': result.status,
            'statusText': result.statusText,
            'data': result.data
        });
    }).catch(err => {
        if (err.code === 'ECONNABORTED' || err.code === 'ECONNREFUSED') {
            return ({
                'code': 408,
                'statusText': err.code,
                'data': JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))) + ' ' + err.code
            });
        } else if (err.response != undefined && (err.response.status.toString()).match('4[0-9]{2}$')) {
            return ({
                'code': err.response.status,
                'statusText': err.response.statusText,
                'data': err.response.data
            });
        } else {
            return ({
                'code': 500,
                'data': JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))) + ' ' + err.code
            });
        }
    });
}

operations.postbonusprogram = async(url, data) => {
    const body = {
        customerRef: data.customerRef,
        bonusProgramId: data.bonusProgramId,
    }

    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
        cert: global.configMicroservices.certKambi,
        key: global.configMicroservices.keyKamni,
        passphrase: global.environment.ssl.passphrase
    })

    return await axios.post(url, body, { httpsAgent }).then((result) => {
        return ({
            'code': result.status,
            'statusText': result.statusText,
            'data': result.data
        });
    }).catch(err => {
        if (err.code === 'ECONNABORTED' || err.code === 'ECONNREFUSED') {
            return ({
                'code': 408,
                'statusText': err.code,
                'data': JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))) + ' ' + err.code
            });
        } else if (err.response != undefined && (err.response.status.toString()).match('4[0-9]{2}$')) {
            return ({
                'code': err.response.status,
                'statusText': err.response.statusText,
                'data': err.response.data
            });
        } else {
            return ({
                'code': 500,
                'data': JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))) + ' ' + err.code
            });
        }
    });
}
// Asignación de bonos por disparadores
operations.postRstasignar_kambi = function(datos, conexion) {
    // conexion--> 1 principal 2 contingencia
    const sql = 'BEGIN BONOS.DISPARADORES_BONOS.REGISTRAR_ASIGNACION_BONO(:p_ID_CAMPANNIA, :p_ID_CUENTA, :P_ESTADO ,:p_CODRESPUESTA, :p_DETRESPUESTA, :p_fecha_asig, :coderror,:descripcionerror); END;';
    const parameters = {
        p_ID_CAMPANNIA: datos.id_campannia,
        p_ID_CUENTA: datos.id_cuenta,
        P_ESTADO: datos.estado,
        p_CODRESPUESTA: datos.cod_respuesta,
        p_DETRESPUESTA: JSON.stringify(datos.desc_respuesta) == undefined ? '0' : JSON.stringify(datos.desc_respuesta),
        p_fecha_asig: moment(datos.fecha_asigna).format('Y-MM-DD HH:mm').toString(),
        coderror: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
        },
        descripcionerror: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING
        }
    };
    if (conexion == 1) {
        console.log('transacción ejecutada en principal');
        return database.getConnection().then(connection => {
            return database.executeQuery(connection, sql, parameters, true).then(result => {
                database.closeConnection(connection);
                return result.outBinds;
            }).catch(err => {
                database.closeConnection(connection);
                return { coderror: 99, descripcionerror: err.message };
            });
        }).catch(err => {
            database.closeConnection(connection);
            return { coderror: 100, descripcionerror: err.message };
        });
    } else {
        console.log('transacción ejecutada en contingencia');
        return database.getConnection().then(connection => {
            return database.executeQuery(connection, sql, parameters, true).then(result => {
                database.closeConnection(connection);
                return result.outBinds;
            }).catch(err => {
                database.closeConnection(connection);
                return { coderror: 99, descripcionerror: err.message };
            });
        }).catch(err => {
            database.closeConnection(connection);
            return { coderror: 100, descripcionerror: err.message };
        });
    }
};


operations.postRewardtemplateBach = async(url, data, tipoBono) => {
    let body = {};
    if (tipoBono == 1) {
        body = {
            customerRef: data.customerRef,
            rewardTemplateId: parseInt(data.rewardTemplateId),
            playerIds: data.playerIds
        }
    } else {
        body = {
            customerRef: data.customerRef,
            bonusProgramId: parseInt(data.rewardTemplateId),
            playerIds: data.playerIds
        }
    }

    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
        cert: global.configMicroservices.certKambi,
        key: global.configMicroservices.keyKamni,
        passphrase: global.environment.ssl.passphrase
    })

    return await axios.post(url, body, { httpsAgent }).then((result) => {
        return ({
            'code': result.status,
            'statusText': result.statusText,
            'data': result.data
        });
    }).catch(err => {
        if (err.code === 'ECONNABORTED' || err.code === 'ECONNREFUSED') {
            return ({
                'code': 408,
                'statusText': err.code,
                'data': JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))) + ' ' + err.code
            });
        } else if (err.response != undefined && (err.response.status.toString()).match('4[0-9]{2}$')) {
            return ({
                'code': err.response.status,
                'statusText': err.response.statusText,
                'data': err.response.data
            });
        } else {
            return ({
                'code': 500,
                'data': JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))) + ' ' + err.code
            });
        }
    });
}

/**
 * Consulta ids, campañas para disparar en el dia Flag =0
 * @param {*} date Fecha para buscar campañas que estan vigentes
 * @returns 
 */
operations.postJackpotGetHeadCampannias = function(date) {
    const sql = 'BEGIN BONOS.DISPARADORES_BONOS.get_campannias(:p_date,:v_campannias,:status_code, :status_desc); END;';
    const parameters = {
        p_date: date,
        v_campannias: {
            dir: oracledb.BIND_OUT,
            type: oracledb.CURSOR
        },
        status_code: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
        },
        status_desc: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING
        }
    };
    return database.getConnection().then(connection => {
        return database.executeQuery(connection, sql, parameters, true).then(result => {
            return database.fetchRowsFromCursor(result.outBinds.v_campannias).then(row => {
                if (row != undefined) {
                    result.outBinds.v_campannias = row;
                } else {
                    result.outBinds.v_campannias = [];
                }
                database.closeConnection(connection);
                return result.outBinds;
            }).catch(err => {
                database.closeConnection(connection);
                return { v_campannias: [],status_code: 98, status_desc: err.message };
            });
        }).catch(err => {
            database.closeConnection(connection);
            return { v_campannias: [],status_code: 99, status_desc: err.message };
        });
    }).catch(err => {
        database.closeConnection(connection);
        return { v_campannias: [],status_code: 100, status_desc: err.message };
    });
};

/**
 * Consulta ids, campañas para disparar en el dia, retorna las campañas vigentes
 * @param {*} id_campannia  Identificador de la campaña
 * @returns 
 */
operations.postJackpotGetCampanniasBlibBlib = function(id_campannia) {
    const sql = 'BEGIN bonos.DISPARADORES_BONOS.get_bonos_kambi(:p_id_campannia,:v_campannias_kambi,:status_code, :status_desc); END;';
    const parameters = {
        p_id_campannia: id_campannia,
        v_campannias_kambi: {
            dir: oracledb.BIND_OUT,
            type: oracledb.CURSOR
        },
        status_code: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
        },
        status_desc: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING
        }
    };

    return database.getConnection().then(connection => {
        return database.executeQuery(connection, sql, parameters, true).then(result => {
            return database.fetchRowsFromCursor(result.outBinds.v_campannias_kambi).then(row => {
                if (row != undefined) {
                    result.outBinds.v_campannias_kambi = row;
                }
                database.closeConnection(connection);
                return result.outBinds;
            }).catch(err => {
                database.closeConnection(connection);
                return { status_code: 98, status_desc: err.message };
            });
        }).catch(err => {
            database.closeConnection(connection);
            return { status_code: 99, status_desc: err.message };
        });
    }).catch(err => {
        database.closeConnection(connection);
        return { status_code: 100, status_desc: err.message };
    });
};


/**
 * Consulta ids players de kambi, para disparar en el dia, retorna players de la camapaña
 * @param {*} id_campannia 
 * @returns 
 */
operations.getJackpotPlayersCampannia = function(id_campannia) {
    const sql = 'BEGIN BONOS.DISPARADORES_BONOS.get_players_campannia(:p_id_campannia,:v_players,:status_code, :status_desc); END;';
    const parameters = {
        p_id_campannia: id_campannia,
        v_players: {
            dir: oracledb.BIND_OUT,
            type: oracledb.CURSOR
        },
        status_code: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
        },
        status_desc: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING
        }
    };

    return database.getConnection().then(connection => {
        return database.executeQuery(connection, sql, parameters, true).then(result => {
            return database.fetchRowsFromCursor(result.outBinds.v_players).then(row => {
                if (row != undefined) {
                    result.outBinds.v_players = row;
                }
                database.closeConnection(connection);
                return result.outBinds;
            }).catch(err => {
                database.closeConnection(connection);
                return { status_code: 98, status_desc: err.message };
            });
        }).catch(err => {
            database.closeConnection(connection);
            return { status_code: 99, status_desc: err.message };
        });
    }).catch(err => {
        database.closeConnection(connection);
        return { status_code: 100, status_desc: err.message };
    });
};

/**
 * retorna las credenciales ftp,y las campañas que se requeiren subir al ftp
 * @returns {*|PromiseLike<T>|Promise<T>}
 */
operations.getCredFtp = () => {
    const sql = `BEGIN bonos.DISPARADORES_BONOS.get_ftp_info(
        :p_ftp_config,
        :p_campannias,
        :STATUS_CODE,
        :STATUS_DESC ); END;`;
    const parameters = {
        p_ftp_config: {
            type: oracledb.STRING,
            dir: oracledb.BIND_OUT
        },
        p_campannias: {
            dir: oracledb.BIND_OUT,
            type: oracledb.CURSOR
        },
        STATUS_CODE: {
            type: oracledb.NUMBER,
            dir: oracledb.BIND_OUT,
        },
        STATUS_DESC: {
            type: oracledb.STRING,
            dir: oracledb.BIND_OUT,
        },
    };

    return database.getConnection().then(connection => {
        return database.executeQuery(connection, sql, parameters, true).then(result => {
            return database.fetchRowsFromCursor(result.outBinds.p_campannias).then(row => {
                result.outBinds.p_campannias = row;
                database.closeConnection(connection);
                return result.outBinds;
            }).catch(err => {
                database.closeConnection(connection);
                return { STATUS_CODE: 98, STATUS_DESC: err.message };
            });
        }).catch(err => {
            database.closeConnection(connection);
            return { STATUS_CODE: 99, STATUS_DESC: err.message };
        });

    });
};

// Actualiza la cabeza para no volver a enviar el ftp 
operations.putUpdateHeadBlibBlib = function(id_campannia, p_status) {
    const sql = 'BEGIN BONOS.DISPARADORES_BONOS.update_head_campannia(:p_id_campannia,:p_status,:status_code, :status_desc); END;';
    const parameters = {
        p_id_campannia: id_campannia,
        p_status: p_status,
        status_code: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
        },
        status_desc: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING
        }
    };

    return database.getConnection().then(connection => {
        return database.executeQuery(connection, sql, parameters, true).then(result => {
            database.closeConnection(connection);
            return result.outBinds;
        }).catch(err => {
            database.closeConnection(connection);
            return { status_code: 99, status_desc: err.message };
        });
    }).catch(err => {
        database.closeConnection(connection);
        return { status_code: 100, status_desc: err.message };
    });
};

// Asignación de bonos por disparadores
operations.postSaveKambiDet = function(datos) {
    const sql = 'BEGIN BONOS.DISPARADORES_BONOS.set_kmb_det(:P_ID_CAMPANNIA,:P_ID_CUENTA,:P_ESTADO,:P_CODRESPUESTA,:P_DETRESPUESTA,:status_code,:status_desc); END;';
    const parameters = {
        P_ID_CAMPANNIA: datos.id_campannia,
        P_ID_CUENTA: datos.id_cuenta,
        P_ESTADO: datos.estado,
        P_CODRESPUESTA: datos.cod_respuesta,
        P_DETRESPUESTA: datos.desc_respuesta == undefined ? '0' : datos.desc_respuesta,
        status_code: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
        },
        status_desc: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING
        }
    };

    return database.getConnection().then(connection => {
        return database.executeQuery(connection, sql, parameters, true).then(result => {
            database.closeConnection(connection);
            return result.outBinds;
        }).catch(err => {
            database.closeConnection(connection);
            return { status_code: 99, status_desc: err.message };
        });
    }).catch(err => {
        database.closeConnection(connection);
        return { status_code: 100, status_desc: err.message };
    });
};

operations.validaPendientes = function() {
    const sql = 'BEGIN BONOS.DISPARADORES_BONOS.GET_TARJETA_BONO_SISRED( :V_CNT_ACTUALIZA, :CODERROR, :DESCRIPCIONERROR); END;';
    const parameters = {
        /*V_PLAYERS: {
            dir: oracledb.BIND_OUT,
            type: oracledb.CURSOR
        },
        V_FECHA_ASIGNA: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DATE
        },*/
        V_CNT_ACTUALIZA: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
        },
        CODERROR: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
        },
        DESCRIPCIONERROR: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING
        }
    };
    return database.getConnection().then(connection => {
        return database.executeQuery(connection, sql, parameters, true).then(result => {
            //return database.fetchRowsFromCursor(result.outBinds.V_PLAYERS).then(row => {
                //result.outBinds.detailPlayer = row;
                database.closeConnection(connection);
                //result.outBinds.V_PLAYERS = null;
                return result.outBinds;
            //}).catch(err => {
            //    database.closeConnection(connection);
            //    return { CODERROR: 500, DESCRIPCIONERROR: err.message };
            //});
        }).catch(err => {
            database.closeConnection(connection);
            return { CODERROR: 500, DESCRIPCIONERROR: err.message };
        });
    }).catch(err => {
        return { CODERROR: 500, DESCRIPCIONERROR: err.message };
    });
}

operations.assignTarjetaSisred = function() {
    const sql = 'BEGIN BONOS.DISPARADORES_BONOS.GET_LIST_TARJETA_BONO_SISRED( :V_PLAYERS, :CODERROR, :DESCRIPCIONERROR); END;';
    const parameters = {
        V_PLAYERS: {
            dir: oracledb.BIND_OUT,
            type: oracledb.CURSOR
        },
        CODERROR: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
        },
        DESCRIPCIONERROR: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING
        }
    };
    return database.getConnection().then(connection => {
        return database.executeQuery(connection, sql, parameters, true).then(result => {
            return database.fetchRowsFromCursor(result.outBinds.V_PLAYERS).then(row => {
                result.outBinds.detailPlayer = row;
                database.closeConnection(connection);
                result.outBinds.V_PLAYERS = null;
                return result.outBinds;
            }).catch(err => {
                database.closeConnection(connection);
                return { CODERROR: 500, DESCRIPCIONERROR: err.message };
            });
        }).catch(err => {
            database.closeConnection(connection);
            return { CODERROR: 500, DESCRIPCIONERROR: err.message };
        });
    }).catch(err => {
        return { CODERROR: 500, DESCRIPCIONERROR: err.message };
    });
}

operations.getCampanniasMultiples = function(idCampannia) {
    const sql = 'BEGIN BONOS.DISPARADORES_BONOS.GET_BONOS_MULTIPLE_KAMBI( :P_ID_CAMPANNIA, :V_PLAYERS, :CODERROR, :DESCRIPCIONERROR); END;';
    const parameters = {
        P_ID_CAMPANNIA: idCampannia,
        V_PLAYERS: {
            dir: oracledb.BIND_OUT,
            type: oracledb.CURSOR
        },
        CODERROR: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING
        },
        DESCRIPCIONERROR: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING
        }
    };
    return database.getConnection().then(connection => {
        return database.executeQuery(connection, sql, parameters, true).then(result => {
            return database.fetchRowsFromCursor(result.outBinds.V_PLAYERS).then(row => {
                result.outBinds.detailBonus = row;
                database.closeConnection(connection);
                result.outBinds.V_PLAYERS = null;
                return result.outBinds;
            }).catch(err => {
                database.closeConnection(connection);
                return { CODERROR: 500, DESCRIPCIONERROR: err.message };
            });
        }).catch(err => {
            database.closeConnection(connection);
            return { CODERROR: 500, DESCRIPCIONERROR: err.message };
        });
    }).catch(err => {
        return { CODERROR: 500, DESCRIPCIONERROR: err.message };
    });
}

operations.getJackpotPlayersCampanniaMultiple = function(id_campannia, id_kambi) {
    const sql = 'BEGIN BONOS.DISPARADORES_BONOS.get_players_campannia_multiple(:p_id_campannia, :p_id_kambi,:v_players,:status_code, :status_desc); END;';
    const parameters = {
        p_id_campannia: id_campannia,
        p_id_kambi: id_kambi,
        v_players: {
            dir: oracledb.BIND_OUT,
            type: oracledb.CURSOR
        },
        status_code: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
        },
        status_desc: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING
        }
    };

    return database.getConnection().then(connection => {
        return database.executeQuery(connection, sql, parameters, true).then(result => {
            return database.fetchRowsFromCursor(result.outBinds.v_players).then(row => {
                if (row != undefined)
                    result.outBinds.v_players = row;
                database.closeConnection(connection);
                return result.outBinds;
            }).catch(err => {
                database.closeConnection(connection);
                return { status_code: 98, status_desc: err.message };
            });
        }).catch(err => {
            database.closeConnection(connection);
            return { status_code: 99, status_desc: err.message };
        });
    }).catch(err => {
        database.closeConnection(connection);
        return { status_code: 100, status_desc: err.message };
    });
};

module.exports = operations;