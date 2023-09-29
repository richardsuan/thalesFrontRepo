'use strict'

const oracledb = require('oracledb');
const database = require('./database');


const init = async () => {
  await configInitial();
  await configIntegrationParameters();
  await configInitialLog();
  await configInitialGames();
};



// Establece la configuración general del microservicio como variable global
const configInitial = async () => {

  try {
    const rows = await getParameters();
    global.parameters = rows;

    const flagPlatform = getParameter(327);

    global.configMicroservices = {
      password: {
          expiration: getParameter(1) || '0',
          regex: getParameter(2) || '0'
      },
      token: {
          activateAccountExpiresIn: getParameter(4) || '24h',
          authenticationExpiresIn: getParameter(5) || '4h'
      },
      // currencyCode: 'COP',
      flagPlatform,
      // localeCode: 'es-ES',
      // jurisdictionCode: 'CO',
    };

  } catch (error) {
    console.error(error);
  }
    // return getParameters().then(async rows => {
    //   global.parameters = rows;

    //     global.configMicroservices = {
    //         password: {
    //             expiration: getParameter(1) || '0',
    //             regex: getParameter(2) || '0'
    //         },
    //         token: {
    //             activateAccountExpiresIn: getParameter(4) || '24h',
    //             authenticationExpiresIn: getParameter(5) || '4h'
    //         },
    //         // currencyCode: 'COP',
    //         currencyCode: await getParamsInternational(getParameter(327)),
    //         localeCode: 'es-ES',
    //         jurisdictionCode: 'CO',
    //         flagPlatform: getParameter(327),
    //     };

    //     return;
    // }).catch(err => {
    //     console.error(err);
    // });
}

const configIntegrationParameters = async () => {
 try {
  
   
   const rows = await getIntegrationParameters();
   global.parameters = rows;
   
   global.configMicroservicesinspired = {
     api: {
        apiUrl: getParameter(1),
        historyUrl: getParameter(2),
        depositUrl: getParameter(3),
        lobbyUrl: getParameter(4),
        skinId: getParameter(5),
        brandId: getParameter(6),
        igpId: getParameter(7),
        rgsId: getParameter(8),
        apiUrlSlots: getParameter(9),
        gameIdVirtuals: getParameter(10)
      }
  };
  
  global.configMicroservices.flagBonoBienvenidaInspired = getParameter(11);

} catch (error) {
 console.error(error);
}
  
  
  // return getIntegrationParameters().then(rows => {
  //   global.parameters = rows;
    
  //     global.configMicroservicesinspired = {
  //       api: {
  //           apiUrl: getParameter(1),
  //           historyUrl: getParameter(2),
  //           depositUrl: getParameter(3),
  //           lobbyUrl: getParameter(4),
  //           skinId: getParameter(5),
  //           brandId: getParameter(6),
  //           igpId: getParameter(7),
  //           rgsId: getParameter(8),
  //           apiUrlSlots: getParameter(9),
  //           gameIdVirtuals: getParameter(10)
  //       }
  //   };

  //   global.configMicroservices.flagBonoBienvenidaInspired = getParameter(11);

  // }).catch(err => {
  //     console.error(err);
  // });
};



// Establece la configuración de los servicios registrados para el proveedor como variable global
const configInitialLog = async () => {

  const rows = await getParametersLogs();

  const getParameterLog = (value) => {
    const result = rows.filter((item) => (item.ID_PARAMLOG == value));
    return result[0].VALOR;
  };

  try {

    global.nameServices = [
      {
        LogCode: 0,
        name: "urlGame",
        LogLevel: getParameterLog(1)
      },
      {
        LogCode: 1,
        name: "verifyPlayerSession",
        LogLevel: getParameterLog(2)
      },
      {
        LogCode: 2,
        name: "startGameSession",
        LogLevel: getParameterLog(3)
      },
      {
        LogCode: 3,
        name: "getPlayerBalance",
        LogLevel: getParameterLog(4)
      },
      {
        LogCode: 4,
        name: "startGameCycle",
        LogLevel: getParameterLog(5)
      },
      {
        LogCode: 5,
        name: "moneyTransactions",
        LogLevel: getParameterLog(6)
      },
      {
        LogCode: 6,
        name: "cancelTransactions",
        LogLevel: getParameterLog(7)
      },
      {
        LogCode: 7,
        name: "cancelGameCycle",
        LogLevel: getParameterLog(8)
      },
      {
        LogCode: 8,
        name: "endGameCycle",
        LogLevel: getParameterLog(9)
      },
      {
        LogCode: 9,
        name: "endGameSession",
        LogLevel: getParameterLog(10)
      },
      // {
      //   LogCode: 10,
      //   name: 'ValidateJSON',
      //   LogLevel: getParameterLog(11)
      // }
    ];
    
  } catch (error) {
    console.error(error);
  }
    // return getParametersLogs().then(rows => {
    //       function getParameterLog(value) {
    //             try {
    //             return (rows.filter(function(item) {
    //               console.log(item.ID_PARAMLOG)
    //                 return (item.ID_PARAMLOG == value);
    //             }))[0].VALOR;
    //         } catch (e) {
    //             return null;
    //         }
    //     }

    //     global.nameServices = [
		// 	{
		// 		LogCode: 0,
		// 		name: "urlGame",
		// 		LogLevel: getParameterLog(1)
		// 	},
    //         {
		// 		LogCode: 1,
		// 		name: "verifyPlayerSession",
		// 		LogLevel: getParameterLog(2)
		// 	},
    //         {
		// 		LogCode: 2,
		// 		name: "startGameSession",
		// 		LogLevel: getParameterLog(3)
		// 	},
    //         {
		// 		LogCode: 3,
		// 		name: "getPlayerBalance",
		// 		LogLevel: getParameterLog(4)
		// 	},
    //         {
		// 		LogCode: 4,
		// 		name: "startGameCycle",
		// 		LogLevel: getParameterLog(5)
		// 	},
    //         {
		// 		LogCode: 5,
		// 		name: "moneyTransactions",
		// 		LogLevel: getParameterLog(6)
		// 	},
    //         {
		// 		LogCode: 6,
		// 		name: "cancelTransactions",
		// 		LogLevel: getParameterLog(7)
		// 	},
    //         {
		// 		LogCode: 7,
		// 		name: "cancelGameCycle",
		// 		LogLevel: getParameterLog(8)
		// 	},
    //         {
		// 		LogCode: 8,
		// 		name: "endGameCycle",
		// 		LogLevel: getParameterLog(9)
		// 	},
    //         {
		// 		LogCode: 9,
		// 		name: "endGameSession",
		// 		LogLevel: getParameterLog(10)
		// 	},
    //         {
    //             LogCode: 10,
    //             name: 'ValidateJSON',
    //             LogLevel: getParameterLog(11)
    //         }
		// ];
    //     return;
    // }).catch(err => {
    //     console.error(err);
    // });
}

const configInitialGames = async () => {
  const rows = await getParametersGames();

  const getParameterGame = () => {
    const gamesInspired = [];

    for (let i = 0; i < rows.length; i++) {
      gamesInspired[i] = rows[i];
    }

    return gamesInspired;
  }

  try {
    global.configGamesInspired = getParameterGame();
  } catch (error) {
    console.error(error);
  }


  // return getParametersGames().then(rows => {
  //     function getParameterGame() {
  //         let gamesInspired = [];

  //         try {
  //             for (let i = 0; i < rows.length; i++) {
  //                 gamesInspired[i] = rows[i];
  //             };

  //             return gamesInspired;
  //         } catch (e) {
  //             return null;
  //         }
  //     }

  //     global.configGamesInspired = getParameterGame();

  // }).catch(err => {
  //     console.error(err);
  // });
};



// Retornar el valor del parametro requerido
function getParameter(value) {
  const parameter = global.parameters.filter(parameter => parameter.CODIGO == value);
  if (parameter.length > 0) return parameter[0].VALOR;

  return null;
}

// Retorna los registros de la tabla parametros 
const getParameters = async () => {

  let connection;
  const sql = 'BEGIN GET_PARAMETERS(:result); END;';
  const parameters = {
      result: {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR
      }
  };


  try {
    connection = await database.getConnection();
    const result = await database.executeQuery(connection, sql, parameters, true);
    const rows = await database.fetchRowsFromCursor(result.outBinds.result);
    
    await database.closeConnection(connection);
    return rows;
    
  } catch (error) {
    if (connection) await database.closeConnection(connection);
    console.error(error);
  }
    // return database.getConnection().then(connection => {
    //     return database.executeQuery(connection, sql, parameters, true).then(result => {
    //         return database.fetchRowsFromCursor(result.outBinds.result).then(rows => {
    //             database.closeConnection(connection);
    //             return rows;
    //         }).catch(err => {
    //             console.error(err);
    //             database.closeConnection(connection);
    //         });
    //     }).catch(err => {
    //         console.error(err);
    //         database.closeConnection(connection);
    //     });
    // }).catch(err => {
    //     console.error(err);
    // });
}


const getIntegrationParameters = async () => {

  let connection;
  const sql = 'BEGIN OBTENER_PARAMETROS_INTEGRACIONES_PR(:p_provider, :p_result); END;';

  const parameters = {
      p_provider: 34,
      p_result: {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR
      }
  };


  try {
    connection = await database.getConnection();
    const result = await database.executeQuery(connection, sql, parameters, true);
    const rows = await database.fetchRowsFromCursor(result.outBinds.p_result);

    await database.closeConnection(connection);
    return rows;

  } catch (error) {
    if (connection) await database.closeConnection(connection);
     console.error(error);
  }
  // return database.getConnection().then(connection => {
  //     return database.executeQuery(connection, sql, parameters, true).then(result => {
  //         return database.fetchRowsFromCursor(result.outBinds.p_result).then(rows => {
  //             database.closeConnection(connection);
  //             return rows;
  //         }).catch(err => {
  //             console.error(err);
  //             database.closeConnection(connection);
  //         });
  //     }).catch(err => {
  //         console.error(err);
  //         database.closeConnection(connection)
  //     });
  // }).catch(err => {
  //     console.error(err);
  //     database.closeConnection(connection);
  // });
};

// Retorna los servicios registrados para el proveedor indicado de acuerdo a la tabla paramlog
const getParametersLogs = async () => {

  let connection;
  const sql = 'BEGIN GET_PARAMETERS_LOGS(:p_id_proveedor, :result); END;';
  const parameters = {
      p_id_proveedor: 34,
      result: {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR
      }
  };


  try {
    connection = await database.getConnection();
    const result = await database.executeQuery(connection, sql, parameters, true);
    const rows = await database.fetchRowsFromCursor(result.outBinds.result);

    await database.closeConnection(connection);
    return rows;

  } catch (error) {
    if (connection) await database.closeConnection(connection);
    console.error(error);
  }
    // return database.getConnection().then(connection => {
    //     return database.executeQuery(connection, sql, parameters, true).then(result => {
    //         return database.fetchRowsFromCursor(result.outBinds.result).then(rows => {
    //             database.closeConnection(connection);
    //             return rows;
    //         }).catch(err => {
    //             console.error(err);
    //             database.closeConnection(connection);
    //         });
    //     }).catch(err => {
    //         console.error(err);
    //         database.closeConnection(connection);
    //     });
    // }).catch(err => {
    //     console.error(err);
    // });
}


const getParametersGames = async () => {
  
  let connection;
  const sql = 'BEGIN GET_PARAMETERS_GAMES(:p_id_proveedor, :result); END;';

  const parameters = {
      p_id_proveedor: 34,
      result: {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR
      }
  };

  try {
    connection = await database.getConnection(connection);
    const result = await database.executeQuery(connection, sql, parameters, true);
    const rows = await database.fetchRowsFromCursor(result.outBinds.result);

    await database.closeConnection(connection);
    return rows;

  } catch (error) {
    if (connection) await database.closeConnection(connection);
    console.error(error);
  }

  // return database.getConnection().then(connection => {
  //     return database.executeQuery(connection, sql, parameters, true).then(result => {
  //         return database.fetchRowsFromCursor(result.outBinds.result).then(rows => {
  //             database.closeConnection(connection);
  //             return rows;
  //         }).catch(err => {
  //             console.error(err);
  //             database.closeConnection(connection);
  //         });
  //     }).catch(err => {
  //         console.error(err);
  //         database.closeConnection(connection);
  //     });
  // }).catch(err => {
  //     console.error(err);
  // });
};

module.exports = { init };