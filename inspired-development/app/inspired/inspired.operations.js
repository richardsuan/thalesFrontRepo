"use strict";

const oracledb = require("oracledb");

const database = require("../common/database");
const games = require('../common/additionalConfig.json');


const searchGame = (gameCode) => {
	const gameId = games.table_games.filter(game => game.codigo == gameCode && game.estado == 1);
  
  if (gameId.length > 0) return ([gameId[0].id_juego, gameId[0].tipo,gameId[0].categoria])
  return null;
};


const convertAmount = (amount, type) => {
  
  if (typeof amount !== 'number') {
		throw new TypeError('El primer parámetro debe ser un número.');
  }

  if(type !== 'division' && type !== 'multiplication'){
		throw new TypeError('El segundo parámetro debe ser "division" o "multiplication".');
	}


  if (type == 'division'){
		return amount / 100;

	} else if (type == 'multiplication') {
		return amount * 100;

	}	else{
		return amount
	} 
}



const urlGame = async (userId, gameId) => {

  if (!userId || !gameId) {
		return Promise.reject({ status_code: 400, status_desc: "Los parámetros de entrada son inválidos" });
	}

  const sql = 'BEGIN INSPIRED_PLAYERS.URL_GAME_PR(:p_userId, :p_gameId, :p_token, :status_code, :status_desc); END;';
  const parameters = {
    p_userId: userId,
    p_gameId: gameId,
    p_token: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING
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

  let connection = null;

  try {
    connection = await database.getConnection();
    const result = await database.executeQuery(connection, sql, parameters, true);
    await database.closeConnection(connection);
    
    return result.outBinds;
  } catch (error) {
    if (connection) await database.closeConnection(connection);

    throw { status_code: 500, status_desc: error.message };
  }
};



const verifyPlayerSession = async (verifyPlayerSession) => {

  const sql = "BEGIN INSPIRED_PLAYERS.VERIFY_PLAYER_SESSION_PR(:p_accountId,:p_tokenFront,:p_gameId,:p_activabono, :p_balance,:p_token,:status_code,:status_desc,:status_message); END;";

  const parameters = {
		p_accountId: verifyPlayerSession.playerId,
		p_tokenFront: verifyPlayerSession.secureToken,
    p_gameId: verifyPlayerSession.gameId,
    p_activabono: verifyPlayerSession.activaBono,
		p_balance: {
			dir: oracledb.BIND_OUT,
			type: oracledb.NUMBER
		},
		p_token: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING
		},
		status_code: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_desc: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_message: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		}
	};


  let connection;
	try {
		connection = await database.getConnection();
		const result = await database.executeQuery(connection, sql, parameters, true);

    await database.closeConnection(connection);

		return result.outBinds;
	} catch (err) {

    if (connection) await database.closeConnection(connection);
		return { status_code: 'IGG_ERR001', status_desc: 'General error.', status_message: err.message };
	}
};


const startGameSession = async ({ playerId, secureToken, gameId, gameSessionId, activaBono }) => {
  const sql = "BEGIN INSPIRED_PLAYERS.START_GAME_SESSION_PR(:p_accountId,:p_token, :p_gameId,:p_gameSessionId,:p_activabono, :p_balance,:status_code,:status_desc,:status_message); END;";

  const parameters = {
	  p_accountId: playerId,
	  p_token: secureToken,
	  p_gameId: gameId,
	  p_gameSessionId: gameSessionId,
    p_activabono: activaBono,
    
	  p_balance: {
		dir: oracledb.BIND_OUT,
		type: oracledb.NUMBER
	  },
	  status_code: {
		dir: oracledb.BIND_OUT,
		type: oracledb.STRING,
	  },
	  status_desc: {
		dir: oracledb.BIND_OUT,
		type: oracledb.STRING,
	  },
	  status_message: {
		dir: oracledb.BIND_OUT,
		type: oracledb.STRING,
	  }
	};


  let connection;
	try {
		connection = await database.getConnection();
		const result = await database.executeQuery(connection, sql, parameters, true);
		await database.closeConnection(connection);
    
    return result.outBinds;

	} catch (err) {
		if (connection) await database.closeConnection(connection);

		return { status_code: 'IGG_ERR001', status_desc: 'General error.', status_message: err.message };
	}  
};



const getPlayerBalance = async (getPlayerBalance) => {
	const sql = "BEGIN INSPIRED_PLAYERS.GET_PLAYER_BALANCE_PR(:p_accountId,:p_token,:p_activabono, :p_balance,:status_code,:status_desc,:status_message); END;";

  const parameters = {
		p_accountId: getPlayerBalance.playerId,
		p_token: getPlayerBalance.secureToken,
    p_activabono: getPlayerBalance.activabono,
		p_balance: {
			dir: oracledb.BIND_OUT,
			type: oracledb.NUMBER
		},
		status_code: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_desc: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_message: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		}

	};


  let connection;
	try {
		connection = await database.getConnection();
		const result = await database.executeQuery(connection, sql, parameters, true);
    await database.closeConnection(connection);

		return result.outBinds;
	} catch (err) {
    if (connection) await database.closeConnection(connection);

		return { status_code: 'IGG_ERR001', status_desc: 'General error.', status_message: err.message };
	}
};


const startGameCycle = async (startGameCycle) => {
	const sql = "BEGIN INSPIRED_PLAYERS.START_GAME_CYCLE_PR(:p_accountId,:p_token, :p_activabono, :p_balance,:status_code,:status_desc,:status_message); END;";

  const parameters = {
		p_accountId: startGameCycle.playerId,
		p_token: startGameCycle.secureToken,
    p_activabono: startGameCycle.activaBono, /* Falta por definir */
		p_balance: {
			dir: oracledb.BIND_OUT,
			type: oracledb.NUMBER
		},
		status_code: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_desc: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_message: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		}

	};

  let connection;
	try {
		connection = await database.getConnection();
		const result = await database.executeQuery(connection, sql, parameters, true);
    await database.closeConnection(connection);

		return result.outBinds;
	} catch (err) {
    if (connection)	await database.closeConnection(connection);
		return { status_code: 'IGG_ERR001', status_desc: 'General error.', status_message: err.message };

	} 
};



const debit = async (debit) => {
  const sql = "BEGIN INSPIRED_PLAYERS.MONEY_TRANSACTIONS_DEBIT_PR(:p_transId,:p_amount,:p_playerId,:p_gameCycleId,:p_token,:p_gameId,:p_activabono, :p_referenceId,:p_balance,:status_code,:status_desc,:status_message, :description); END;";	

  const parameters = {
    p_transId: debit.transId,
		p_amount: debit.transAmt,
		p_playerId: debit.playerId,
		p_gameCycleId: debit.gameCycleId,
		p_token: debit.secureToken,
		p_gameId: debit.gameId,
    p_activabono: debit.activaBono,
		p_referenceId: {
      dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		p_balance: {
      dir: oracledb.BIND_OUT,
			type: oracledb.NUMBER
		},
		status_code: {
      dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_desc: {
      dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_message: {
      dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
    description: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
    }
	};


  let connection;
	try {
		connection = await database.getConnection();
		const result = await database.executeQuery(connection, sql, parameters, true);
    await database.closeConnection(connection);

		return result.outBinds;
	} catch (err) {
    if (connection) await database.closeConnection(connection);
		return { status_code: 'IGG_ERR001', status_desc: 'General error.', status_message: err.message };

	}
};


const credit = async (credit) => {
	const sql = "BEGIN INSPIRED_PLAYERS.MONEY_TRANSACTIONS_CREDIT_PR(:p_transId,:p_amount,:p_playerId,:p_gameCycleId,:p_activabono, :p_referenceId,:p_balance,:status_code,:status_desc,:status_message); END;";	

  const parameters = {
		p_transId: credit.transId,
		p_amount: credit.transAmt,
		p_playerId: credit.playerId,
		p_gameCycleId: credit.gameCycleId,
    P_activabono: credit.activaBono,
		p_referenceId: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		p_balance: {
			dir: oracledb.BIND_OUT,
			type: oracledb.NUMBER
		},
		status_code: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_desc: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_message: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		}
	};


  let connection;
	try {
		connection = await database.getConnection();
		const result = await database.executeQuery(connection, sql, parameters, true);
    await database.closeConnection(connection);

		return result.outBinds;
	} catch (err) {
    if (connection) await database.closeConnection(connection);
		return { status_code: 'IGG_ERR001', status_desc: 'General error.', status_message: err.message };
	} 
};




const cancelTransactions = async (cancelTransactions) => {
	const sql = "BEGIN INSPIRED_PLAYERS.CANCEL_TRANSACTIONS_PR(:p_transId,:p_transAmt,:p_transType,:p_referenceId,:p_playerId,:p_gameCycleId,:p_activabono, :p_cancelId,:p_balance,:status_code,:status_desc,:status_message); END;";	


  const parameters = {
		p_transId: cancelTransactions.transId,
		p_transAmt: cancelTransactions.transAmt,
		p_transType: cancelTransactions.transType,
		p_referenceId: cancelTransactions.referenceId,
		p_playerId: cancelTransactions.playerId,
		p_gameCycleId: cancelTransactions.gameCycleId,
    p_activabono: cancelTransactions.activaBono,
		p_cancelId: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		p_balance: {
			dir: oracledb.BIND_OUT,
			type: oracledb.NUMBER
		},
		status_code: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_desc: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_message: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		}
	};

  let connection;
	try {
		connection = await database.getConnection();
		const result = await database.executeQuery(connection, sql, parameters, true);
    await database.closeConnection(connection);

		return result.outBinds;
	} catch (err) {
    if (connection) await database.closeConnection(connection);
		return { status_code: 'IGG_ERR001', status_desc: 'General error.', status_message: err.message };
	} 
}


const cancelGameCycle = async (playerId, gameCycleId, cancelGameCycle) => {
  if (!playerId || !gameCycleId) return Promise.reject({ status_code: 400, status_desc: "Los parámetros de entrada son inválidos" });

	const sql = "BEGIN INSPIRED_PLAYERS.CANCEL_GAME_CYCLE_PR(:p_playerId,:p_gameCycleId,:p_activabono, :p_transactionOut,:p_balance,:status_code,:status_desc,:status_message); END;";	

  const parameters = {
		p_playerId: playerId,
		p_gameCycleId: gameCycleId,
    p_activabono: cancelGameCycle.activaBono,
		p_transactionOut: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
			maxSize: 30000
		},
		p_balance: {
			dir: oracledb.BIND_OUT,
			type: oracledb.NUMBER
		},
		status_code: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_desc: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_message: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		}
	};


  let connection;
	try {
		connection = await database.getConnection();
		const result = await database.executeQuery(connection, sql, parameters, true);
    await database.closeConnection(connection);

		return result.outBinds;
	} catch (err) {
    if (connection)	await database.closeConnection(connection);
		return { status_code: 'IGG_ERR001', status_desc: 'General error.', status_message: err.message };
	}
}




const endGameCycle = async (playerId, gameCycleId, secureToken, activaBono) => {
  if (!playerId || !gameCycleId  || !secureToken) return Promise.reject({ status_code: 400, status_desc: "Los parámetros de entrada son inválidos" });

	const sql = "BEGIN INSPIRED_PLAYERS.END_GAME_CYCLE_PR(:p_playerId,:p_gameCycleId,:p_token,:p_activabono, :p_balance,:status_code,:status_desc,:status_message); END;";	

  const parameters = {
		p_playerId: playerId,
		p_gameCycleId: gameCycleId,
		p_token: secureToken,
    p_activabono: activaBono,
		p_balance: {
			dir: oracledb.BIND_OUT,
			type: oracledb.NUMBER
		},
		status_code: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_desc: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_message: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		}
	};

  let connection;
	try {
		connection = await database.getConnection();
		const result = await database.executeQuery(connection, sql, parameters, true);
    await database.closeConnection(connection);
    
		return result.outBinds;
	} catch (err) {
    if (connection) await database.closeConnection(connection);
		return { status_code: 'IGG_ERR001', status_desc: 'General error.', status_message: err.message };
	}
};




const endGameSession = async (playerId, secureToken, activaBono) => {
  if (!playerId || !secureToken) return Promise.reject({ status_code: 400, status_desc: "Los parámetros de entrada son inválidos" });


	const sql = "BEGIN INSPIRED_PLAYERS.END_GAME_SESSION_PR(:p_playerId,:p_token,:p_activabono, :p_balance,:status_code,:status_desc,:status_message); END;";	
	const parameters = {
		p_playerId: playerId,
		p_token: secureToken,
    p_activabono: activaBono,
		p_balance: {
			dir: oracledb.BIND_OUT,
			type: oracledb.NUMBER
		},
		status_code: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_desc: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		},
		status_message: {
			dir: oracledb.BIND_OUT,
			type: oracledb.STRING,
		}
	};


  let connection;
	try {
		connection = await database.getConnection();
		const result = await database.executeQuery(connection, sql, parameters, true);
    await database.closeConnection(connection);

		return result.outBinds;
	} catch (err) {
    if (connection) await database.closeConnection(connection);
		return { status_code: 'IGG_ERR001', status_desc: 'General error.', status_message: err.message };
	}
}





const getUserData = async (userId, gameId, platFormFlag) => {
  const sql = "BEGIN INSPIRED_PLAYERS.GET_USER_DATA_PR(:p_user_id, :p_game_id, :p_platform_flag, :p_session_id, :p_session_ip, :p_currency_code, :p_country_code, :p_language_code, :status_code, :status_desc); END;";

  const parameters = {
	  p_user_id: userId,
	  p_game_id: gameId,
	  p_platform_flag: platFormFlag,
	  p_session_id: {
		dir: oracledb.BIND_OUT,
		type: oracledb.STRING,
	  },
	  p_session_ip: {
		dir: oracledb.BIND_OUT,
		type: oracledb.STRING,
	  },
	  p_currency_code: {
		dir: oracledb.BIND_OUT,
		type: oracledb.STRING,
	  },
	  p_country_code: {
		dir: oracledb.BIND_OUT,
		type: oracledb.STRING,
	  },
	  p_language_code: {
		dir: oracledb.BIND_OUT,
		type: oracledb.STRING,
	  },
	  status_code: {
		dir: oracledb.BIND_OUT,
		type: oracledb.NUMBER,
	  },
	  status_desc: {
		dir: oracledb.BIND_OUT,
		type: oracledb.STRING,
	  },
	};


  let connection;
	try {
		connection = await database.getConnection();
		const result = await database.executeQuery(connection, sql, parameters, true);
    await database.closeConnection(connection);

		return result.outBinds;
	} catch (err) {
    if (connection) await database.closeConnection(connection);
		return { status_code: 'IGG_ERR001', status_desc: 'General error.', status_message: err.message };
	}
}


const getUserDataForToken = async (userId, secureToken) => {
  const sql = `SELECT ID_PERSONA, ID_JUEGO FROM SISPLAY.SESIONES WHERE ID_SESION = :p_secure_token`;

  const parameters = {
    p_secure_token: secureToken
  };

  let connection;

  try {
    connection = await database.getConnection();
    const result = await database.executeQuery(connection, sql, parameters, true);
    await database.closeConnection(connection);

    const userData = await getUserData(userId, result.rows.ID_JUEGO, global.configMicroservices.flagPaltform);

    return userData;    
  } catch (error) {
    if (connection) await database.closeConnection(connection);
    return { status_code: 'IGG_ERR001', status_desc: 'General error.', status_message: 'getUserDataForToken not found.' };
  }
};


module.exports = { 
  searchGame, 
  convertAmount, 
  urlGame, 
  verifyPlayerSession,
  startGameSession, 
  getPlayerBalance, 
  startGameCycle, 
  debit,
  credit, 
  cancelTransactions, 
  cancelGameCycle, 
  endGameCycle, 
  endGameSession, 
  getUserData ,
  getUserDataForToken
};


