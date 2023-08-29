if (global.poolConfiguration.poolMax > 4) {
    process.env.UV_THREADPOOL_SIZE = global.poolConfiguration.poolMax;
}

const oracledb = require('oracledb');
oracledb.fetchAsString = [ oracledb.CLOB, oracledb.BUFFER ];

const databaseFuncs = {};

	
const config = {
    user: global.environment.contingencia_db.user,
    password: global.environment.contingencia_db.password,
    connectString: global.environment.contingencia_db.connectString,
    events: global.poolConfiguration.events,
    externalAuth: global.poolConfiguration.externalAuth,
    poolIncrement: global.poolConfiguration.poolIncrement,
    poolAlias: 'corredorcont',//global.poolConfiguration.poolAliasCont,
    poolMax: global.poolConfiguration.poolMax,
    poolMin: global.poolConfiguration.poolMin,
    poolPingInterval: global.poolConfiguration.poolPingInterval,
    poolTimeout: global.poolConfiguration.poolTimeout,
    queueTimeout: global.poolConfiguration.queueTimeout,
    stmtCacheSize: global.poolConfiguration.stmtCacheSize
};

databaseFuncs.init = function () {
    return oracledb.createPool(config).then(pool => {
        return pool;
    }).catch(err => {
        console.error(err);
        return null;
    });
};

databaseFuncs.getConnection = function () {
    const pool = oracledb.getPool(config.poolAlias);
    return pool.getConnection().then(connect => {
        return connect;
    });
};

databaseFuncs.closeConnection = function (connection) {
    connection.close(function (err) {
        if (err) console.error(err);
    });
};

databaseFuncs.executeQuery = function (connection, sql, parameters = [], autoCommit = false) {
    return connection.execute(sql, parameters, { outFormat: oracledb.OBJECT, autoCommit: autoCommit }).catch(err =>{
        this.closeConnection(connection);
        throw err;
    });
};


databaseFuncs.fetchRowsFromCursor = function (resultSet) {
    const numRows = 50000;
    return resultSet.getRows(numRows).then(result => {
        resultSet.close();
        return result;
    }).catch(err => {
        console.log(err);
    });
};

databaseFuncs.fetchRowFromCursor = function (resultSet) {
    return resultSet.getRow().then(result => {
        resultSet.close();
        return result;
    });
};

//////////// PRINCIPAL
const configPrin = {
    user: global.environment.db.user,
    password: global.environment.db.password,
    connectString: global.environment.db.connectString,
    events: global.poolConfiguration.events,
    externalAuth: global.poolConfiguration.externalAuth,
    poolIncrement: global.poolConfiguration.poolIncrement,
    poolAlias: global.poolConfiguration.poolAlias,
    poolMax: global.poolConfiguration.poolMax,
    poolMin: global.poolConfiguration.poolMin,
    poolPingInterval: global.poolConfiguration.poolPingInterval,
    poolTimeout: global.poolConfiguration.poolTimeout,
    queueTimeout: global.poolConfiguration.queueTimeout,
    stmtCacheSize: global.poolConfiguration.stmtCacheSize
};

databaseFuncs.initPrin = function () {
    return oracledb.createPool(configPrin).then(pool1 => {
        return pool1;
    }).catch(err => {
        console.error(err);
        return null;
    });
};

databaseFuncs.getConnectionPrin = function () {
    const pool1 = oracledb.getPool(configPrin.poolAlias);
    return pool1.getConnection().then(connect1 => {
        return connect1;
    });
};

module.exports = databaseFuncs;