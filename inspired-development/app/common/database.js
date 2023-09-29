'use strict';

const oracledb = require('oracledb');

if (global.poolConfiguration.poolMax > 4) {
    process.env.UV_THREADPOOL_SIZE = global.poolConfiguration.poolMax;
}


const initDatabase = async () => {
  await init();
};

const config = {
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

//Creación de pool  para conexiones
const init = async () => {
  try {
    return await oracledb.createPool(config);
  } catch (error) {
    console.error(error);
    return null;
  }
};
//Conexión a la base de datos
const getConnection = async () => {
  try {
    const pool = oracledb.getPool(config.poolAlias);
    return await pool.getConnection();
  } catch (error) {
    console.error(error);
    return null;
  }
};

//Cierre de conexión a la base de datos
const closeConnection = async (connection) => {
  try {
    await connection.close();
  } catch (error) {
    console.error(error);
  }
};

//Ejecuta sentencia de base de datos que se envia
const executeQuery = async (
  connection,
  sql,
  parameters = [],
  autoCommit = false
) => {
  try {    
    return await connection.execute(sql, parameters, {
      outFormat: oracledb.OBJECT,
      autoCommit,
    });

  } catch (error) {
    return error;
  }
};

//organiza la data que entrega la base de datos 
const fetchRowsFromCursor = async (resultSet) => {
  try {
    const numRows = 1500;
    const result = await resultSet.getRows(numRows);

    await resultSet.close();
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};

//organiza la data que entrega la base de datos
const fetchRowFromCursor = async (resultSet) => {
  try {
    const result = await resultSet.getRow();
    await resultSet.close();
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};


module.exports = {
  initDatabase,
  getConnection,
  closeConnection,
  executeQuery,
  fetchRowsFromCursor,
  fetchRowFromCursor,
};
