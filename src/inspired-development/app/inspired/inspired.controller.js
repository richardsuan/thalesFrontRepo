"use strict";

const { URLSearchParams } = require('url');
const { errors, customResponse } = require('../common/response.management');
const { insertLog } = require('../common/logger');
const operations = require('./inspired.operations');


const launchGame = async (request, response) => {
  const service = 0;
  const startTime = new Date();

  const { gameCode } = request.body;
  const userId = request.tokenData.id;
  const game = operations.searchGame(gameCode);

  if (!game) {
    errors(response, request.method, service, request.path, { time1: startTime, message1: { body: request.body, token: request.tokenData }, LogType: 'Rq'}, 
    { time2: new Date(), message2: { code: 400, errorCode: 400, errorMessage: 'Game not found or disabled', LogType: 'Rs' } });
  }

  const result = await operations.urlGame(userId, game[0]);

  insertLog(service, request.path, request.method, { time1: startTime, message1: { userId, game: game[0] }, LogType: 'Rq' }, { time2: new Date(), message2: { status_code: result.status_code, status_desc: result.status_desc, token: result.p_token }, LogType: 'Rs' });


  const { apiUrl, apiUrlSlots, rgsId, igpId, brandId, skinId, lobbyUrl, depositUrl, historyUrl, gameIdVirtuals } = global.configMicroservicesinspired.api;
  const { localeCode } = global.configMicroservices;

  const userData = await operations.getUserData(userId, game[0], global.configMicroservices.flagPlatform);

  const queryParams = {
    rgsId, 
    igpId, 
    brandId, 
    skinId, 
    gameId: game[1] === 258 ? gameIdVirtuals : gameCode, 
    category: game[2],
    channelType: 'desktop',
    presentType: 'HTML5',
    secureToken: result.p_token,
    playerId: userId,
    accountId: userId,
    localeCode,
    currencyCode :userData.p_currency_code,
    IGG_homeUrl: lobbyUrl,
    IGG_depositUrl: depositUrl,
    IGG_historyUrl: historyUrl
  };

  const configUrl = '?' + new URLSearchParams(queryParams).toString();
  const url = game[1] === 258 ? apiUrl + configUrl : apiUrlSlots + configUrl;

  const responseObj = result.status_code == 200
  ? { time2 : new Date(), code: 200, message2: { url: url, error: null, description: result.status_desc }, LogType: 'Rs'}
  : { time2: new Date(), message2: { code: 400, errorCode: result.status_code, errorMessage: result.status_desc }, LogType: 'Rs'};

  result.status_code == 200 
  ? customResponse(response, request.method, service, request.path, { time1: startTime, message1: { body: request.body, token: request.tokenData }, LogType: 'Rq'}, responseObj)
  : errors(response, request.method, service, request.path, { time1: startTime, message1: { body: request.body, token: request.tokenData }, LogType: 'Rq'}, responseObj)

};




const verifyPlayerSession = async (request, response) => {

  const service = 1;
  const startTime = new Date();

  const verifyPlayerSession = {
    ...request.body.request,
    ...request.body.request.data
  };

  verifyPlayerSession.activaBono = global.configMicroservices.flagBonoBienvenidaInspired;  
  verifyPlayerSession.activaBono = (verifyPlayerSession.activaBono == (1 || 0)) ? verifyPlayerSession.activaBono : 0;

  const gameId = operations.searchGame(verifyPlayerSession.gameId);


  if (gameId === null) {
    return errors(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, { time2: new Date(), message2: { code: 400,  errorCode: 'IGG_ERR001', errorMessage: 'General error. Game not found or disabled', requestId: verifyPlayerSession.requestId}, LogType: 'Rs' })
  }


  verifyPlayerSession.gameId = gameId[0];

  try {

    const result = await operations.verifyPlayerSession(verifyPlayerSession);
    const userData = await operations.getUserData(verifyPlayerSession.playerId, verifyPlayerSession.gameId, global.configMicroservices.flagPlatform);

    if (result.status_code == 0) {

      const verifyPlayerSessionResp = {
        response: {
          rgsId: global.configMicroservicesinspired.api.rgsId,
          igpId: global.configMicroservicesinspired.api.igpId,
          requestId: verifyPlayerSession.requestId,
          command: "TPI_playerSessionAck",
          data: {
            secureToken: result.p_token,
            jurisdictionCode: userData.p_country_code,
            accountBalance: {
              playerId: verifyPlayerSession.playerId,
              accountId: verifyPlayerSession.playerId,
              currencyCode:  userData.p_currency_code,
              messageArray: [],
              availBalanceAmt: (result.p_balance) * 100,
              balanceArray: [
                {
                  balanceType: 'cashable',
                  balanceAmt: (result.p_balance) * 100
                }
              ]
            }
          }
        }
      };
  
      customResponse(response, request.method, service, request.path,{ time1: startTime, message1: request.body, LogType: 'Rq'}, { time2: new Date(), code: 200, message2: verifyPlayerSessionResp, LogType: 'Rs' });


    } else {
      errors(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, 
      { time2: new Date(), message2: {  code: 401, errorCode: result.status_code, errorMessage: result.status_desc }, LogType: 'Rs' });
    }
    
  } catch (error) {
    errors(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq'}, { time2: new Date(), message2:{ code: 500, errorCode: 'IGG_ERR001', errorMessage: 'General error.' }, LogType2: 'Rs'});
  }

};




const startGameSession = async (request, response) => {
  const service = 2;
  const startTime = new Date();

  const { rgsId, igpId, requestId, data } = request.body.request;
  const startGameSession = {
      rgsId,
      igpId,
      requestId,
      brandId: data.brandId,
      skinId: data.skinId,
      gameId: data.gameId,
      secureToken: data.secureToken,
      playerId: data.playerId,
      localeCode: data.localeCode,
      currencyCode: data.currencyCode,
      jurisdictionCode: data.jurisdictionCode,
      gameSessionId: data.gameSessionId
  };


  startGameSession.activaBono = global.configMicroservices.flagBonoBienvenidaInspired;    
  startGameSession.activaBono = (startGameSession.activaBono == (1 || 0)) ? startGameSession.activaBono : 0;

  const gameId = operations.searchGame(startGameSession.gameId);

  if (!gameId) {
    errors(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, { time2: new Date(), message2: { code: 400, errorCode: 'IGG_ERR001', errorMessage: 'General error. Game not found or disabled' }, LogType: 'Rs'});

   }


   try {

    startGameSession.gameId = gameId[0];
    const startGameSessionResult = await operations.startGameSession(startGameSession)

    insertLog(service, request.path, request.method, { time1: startTime, message1: startGameSession, LogType: 'Rq'}, { time2: new Date(), message2: startGameSessionResult, LogType: 'Rs'});

    if (startGameSessionResult.status_code == 0) {

      const startGameSessionResp = {
        response:{
        rgsId: global.configMicroservicesinspired.api.rgsId,
        igpId: global.configMicroservicesinspired.api.igpId,
        requestId: startGameSession.requestId,
        command: "TPI_gameSessionAck",
        data:{
            secureToken: startGameSession.secureToken,
            gameSessionId: startGameSession.gameSessionId,
            accountBalance:{
            playerId: startGameSession.playerId,
            accountId: startGameSession.playerId,
            currencyCode: global.configMicroservices.currencyCode,
            messageArray:[],
            availBalanceAmt: (startGameSessionResult.p_balance) * 100,
            balanceArray:[
                {
                balanceType: 'cashable',
                balanceAmt: (startGameSessionResult.p_balance) * 100
                }
              ]
            }
          }
        }
      };

      customResponse(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, { time2: new Date(), code: 200, message2: startGameSessionResp, LogType: 'Rs' });

    } else {
      errors(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, { time2: new Date(), message2: {
      code: 401, errorCode: startGameSessionResult.status_code, errorMessage: startGameSessionResult.status_desc, message: startGameSessionResult.status_message, requestId: startGameSession.requestId }, LogType: 'Rs' });
    }

   } catch (errorObject) {
      const error = JSON.parse(JSON.stringify(errorObject, Object.getOwnPropertyNames(errorObject)));

      errors(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, 
      { time2: new Date(), message2: { code: 401,  errorCode: 'IGG_ERR001', errorMessage: 'General error.', message: error.message, requestId: startGameSession.requestId }, LogType: 'Rs'});    
   }

};



const getPlayerBalance = async (request, response) => {
  const service = 3;
  const startTime = new Date();

  const { rgsId, igpId, requestId, data } = request.body.request;
  const { brandId, skinId, secureToken, playerId, localeCode } = data;
  const getPlayerBalance = { rgsId, igpId, requestId, brandId, skinId, secureToken, playerId, localeCode };

  getPlayerBalance.activaBono = global.configMicroservices.flagBonoBienvenidaInspired;
  getPlayerBalance.activaBono = (getPlayerBalance.activaBono == (1 || 0)) ? getPlayerBalance.activaBono : 0;

  try {

    const result = await operations.getPlayerBalance(getPlayerBalance);

    insertLog(service, request.path, request.method, { time1: startTime, message1: getPlayerBalance, LogType: 'Rq'}, 
    { time2: new Date(), message2: result, LogType: 'Rs' });


    if (result.status_code == 0) { 
      const balanceAmt = result.p_balance * 100;

      const getPlayerBalanceResp = {
        response:{
            rgsId: global.configMicroservicesinspired.api.rgsId,
            igpId: global.configMicroservicesinspired.api.igpId,
            requestId: requestId,
            command: "TPI_playerBalance",
            data:{
                accountBalance:{
                    playerId: playerId,
                    accountId: playerId,
                    currencyCode: global.configMicroservices.currencyCode,
                    messageArray:[],  
                    availBalanceAmt: balanceAmt,
                    balanceArray:[
                        {
                            balanceType: 'cashable',
                            balanceAmt: balanceAmt
                        }
                    ]
                }
            }
        }
      };


      customResponse(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq'}, { time2: new Date(), code: 200, message2: getPlayerBalanceResp, LogType: 'Rs' });

    } else {
      errors(response, request.method, service, request.path, { time1: startTime, message1: '', LogType: 'Rq'}, { time2: new Date(), message2: { code: 400, errorCode: result.status_code, errorMessage: result.status_desc }, LogType: 'Rs' });
    }
    
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const statusMessage = error.statusMessage || 'General error.';
    const message = error.message || error;

    errors(response, request.method, service, request.path, { time1 : startTime, message1: request.body, LogType: 'Rq'}, 
        { time2: new Date(), message2: { code: statusCode, errorCode: statusCode, errorMessage: statusMessage, message, requestId }, LogType: 'Rs'});
  }
};


const generateStartGameCycleResponse = (startGameCycle, pBalanceAmt) => {
  return {
    response:{
      rgsId: global.configMicroservicesinspired.api.rgsId,
      igpId: global.configMicroservicesinspired.api.igpId,
      requestId: startGameCycle.requestId,
      command: "TPI_startGameCycleAck",
      data:{
        secureToken: startGameCycle.secureToken,
        playerId: startGameCycle.playerId,
        accountId: startGameCycle.playerId,
        gameSessionId: startGameCycle.gameSessionId,
        gameCycleId: startGameCycle.gameCycleId,
        accountBalance:{
          playerId: startGameCycle.playerId,
          accountId: startGameCycle.playerId,
          currencyCode: global.configMicroservices.currencyCode,
          messageArray:[],
          availBalanceAmt: pBalanceAmt,
          balanceArray:[
            {
              balanceType: 'cashable',
              balanceAmt: pBalanceAmt
            }
          ]
        }
      }
    }
  };
}

const startGameCycle = async (request, response) => {
  const startTime = new Date();
  const service = 4;

  const { rgsId, igpId, requestId, data } = request.body.request;
  const startGameCycle = {
    rgsId,
    igpId,
    requestId,
    brandId: data.brandId,
    skinId: data.skinId,
    secureToken: data.secureToken,
    playerId: data.playerId,
    localeCode: data.localeCode,
    currencyCode: data.currencyCode,
    gameSessionId: data.gameSessionId,
    gameCycleId: data.gameCycleId,
  };


  startGameCycle.activaBono = configMicroservices.flagBonoBienvenidaInspired;
  startGameCycle.activa = (startGameCycle.activaBono == (1 || 0)) ? startGameCycle.activaBono : 0;

  try {

    const result = await operations.startGameCycle(startGameCycle);
    const pBalanceAmt = result.p_balance * 100;

    insertLog(service, request.path, request.method, { time1: startTime, message1: startGameCycle, LogType: 'Rq'}, 
    { time2: new Date(), message2: result, LogType: 'Rs' });


    if (result.status_code == 0) {

      const startGameCycleResp = generateStartGameCycleResponse(startGameCycle, pBalanceAmt);

      customResponse(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, { time2: new Date(), code: 200, message2: startGameCycleResp, LogType: 'Rs' });

    } else {
      errors(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, {
        time2: new Date(),
        message2: {
        code: 400,
        errorCode: result.status_code,
        errorMessage: result.status_desc,
        message: result.status_message,
        requestId: startGameCycle.requestId
      }, LogType: 'Rs'});
    }
    
  } catch (error) {
    errors(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq'}, {
      time2: new Date(),
      message2: {
        code: 400,
        errorCode: 'IGG_ERR001',
        errorMessage: 'General error.',
        message: err.message,
        requestId: startGameCycle.requestId
    }, LogType: 'Rs'}); 
  }
};



const moneyTransactions = async (request, response) => {
  const startTime = new Date();
  const service = 5;

  const { rgsId, igpId, requestId, data } = request.body.request;
  const { brandId, skinId, secureToken, playerId, localeCode, currencyCode, gameCycleId, gameSessionId, moneyTransArray, IGG_subGameId } = data;

  const [ firstMoneyTrans ] = moneyTransArray || [];
  const { transId, transAmt, transType, transCategory, transSeq } = firstMoneyTrans || {};

  const moneyTransactions = {
    rgsId, igpId, requestId,
    brandId, skinId, secureToken, playerId, localeCode, currencyCode, gameCycleId, gameSessionId,
    moneyTransArray: (moneyTransArray) ? 'OK' : '',
    transId: transId || '',
    transAmt: transAmt || '',
    transType: transType || '',
    transSeq: transSeq || '',
    transCategory: transCategory || ''
  };


  moneyTransactions.activaBono = global.configMicroservices.flagBonoBienvenidaInspired;
  moneyTransactions.activaBono = (moneyTransactions.activaBono == (1 || 0)) ? moneyTransactions.activaBono: 0;


  if (IGG_subGameId) {

    const game = operations.searchGame(IGG_subGameId);

    if (!game) {
      errors(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq'}, {
        time2: new Date(),
        message2: {
          code: 404,
          errorCode: 'IGG_ERR001', 
          errorMessage: 'General error. Game not found or disabled', 
          requestId: moneyTransactions.requestId 
      }, LogType: 'Rs' });
    }

    moneyTransactions.gameId = game[0];
  } else {
    moneyTransactions.gameId = null;
  }

  moneyTransactions.transAmt = operations.convertAmount(transAmt, 'division');
  const operationsFunction = moneyTransactions.transType === 'debit' ? operations.debit : operations.credit;

  try {
    const result = await operationsFunction(moneyTransactions);

    insertLog(service, request.path, request.method, { time1: startTime, message1: moneyTransactions, LogType: 'Rq1' }, 
    { time2: new Date(), message2: result, LogType: 'Rs1' });

    if (result.status_code == 0) {
      const convertedTransAmt = operations.convertAmount(transAmt, 'multiplication');
      const convertedBalance = operations.convertAmount(result.p_balance, 'multiplication');
      const transDay = new Date().toISOString().slice(0, 10);

      const moneyTransactionsResp = {
        response: {
            rgsId: global.configMicroservicesinspired.api.rgsId,
            igpId: global.configMicroservicesinspired.api.igpId,
            requestId,
            command: "TPI_moneyTransactionsAck",
            data: {
                playerId, gameSessionId, gameCycleId,
                accountId: playerId,
                moneyAckArray: [{
                    transSeq, transId, transAmt: convertedTransAmt, transType, transCategory,
                    referenceId: result.p_referenceId,
                    transDay,
                    moneyDetailArray: [{
                        balanceType: "cashable",
                        detailAmt: convertedTransAmt,
                        detailType: transType,
                        balanceAmt: convertedBalance,
                    }],
                }],
                accountBalance: {
                    playerId, accountId: playerId,
                    currencyCode: global.configMicroservices.currencyCode,
                    messageArray: [],
                    availBalanceAmt: convertedBalance,
                    balanceArray: [{
                        balanceType: "cashable",
                        balanceAmt: convertedBalance,
                    }],
                },
            },
        },
      };


      customResponse(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, { time2: new Date(), code: 200, message2: moneyTransactionsResp, LogType: 'Rs'});


    } else {
      errors(response, request.method, service, request.path, { time1:startTime, message1: request.body, LogType: 'Rq'}, {
        time2: new Date(),
        message2: {
          code: 400,
          errorCode: result.status_code, 
          errorMessage: result.status_desc, 
          message: result.status_message, 
          requestId
      }, LogType: 'Rs'});
    }

  } catch (err) {
    const errorObj = {
      time2: new Date(),
      message2: {
        code: 500,
        errorCode: "IGG_ERR001",
        errorMessage: "General error.",
        message: err.message,
        requestId,
    }, LogType: 'Rs'};

    errors(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq'}, errorObj);
  }

};


const cancelTransactions = async (request, response) => {
  const startTime = new Date();
  const service = 6;

  const cancelTransactions = {
    rgsId: request.body.request.rgsId,
    igpId: request.body.request.igpId,
    requestId: request.body.request.requestId,
    brandId: request.body.request.data.brandId,
    skinId: request.body.request.data.skinId,
    playerId: request.body.request.data.playerId,
    localeCode: request.body.request.data.localeCode,
    currencyCode: request.body.request.data.currencyCode,
    gameCycleId: request.body.request.data.gameCycleId,
    gameSessionId: request.body.request.data.gameSessionId,
    cancelTransArray: (request.body.request.data.cancelTransArray)?'OK':'',
    transId: (request.body.request.data.cancelTransArray)?request.body.request.data.cancelTransArray[0].transId:'',
    transAmt: (request.body.request.data.cancelTransArray)?request.body.request.data.cancelTransArray[0].transAmt:'',
    transType: (request.body.request.data.cancelTransArray)?request.body.request.data.cancelTransArray[0].transType:'',
    referenceId: (request.body.request.data.cancelTransArray)?request.body.request.data.cancelTransArray[0].referenceId:''
  };

  cancelTransactions.activaBono = global.configMicroservices.flagBonoBienvenidaInspired;
  cancelTransactions.activaBono = (cancelTransactions.activaBono == (1 || 0)) ? cancelTransactions.activaBono: 0;

  try {
    cancelTransactions.transAmt = operations.convertAmount(request.body.request.data.cancelTransArray[0].transAmt,'division');
    cancelTransactions.transType = cancelTransactions.transType == 'debit' ? 138 : 44;

    const result = await operations.cancelTransactions(cancelTransactions);

    insertLog(service, request.path, request.method, { time1: startTime, message1: cancelTransactions, LogType: 'Rq' }, { time2: new Date(), message2: result, LogType: 'Rs' });

    if (result.status_code == 0) {
      const cancelDay = new Date().toISOString().slice(0, 10);

      const cancelTransactionsResp = {
        response:{
            rgsId: global.configMicroservicesinspired.api.rgsId,
            igpId: global.configMicroservicesinspired.api.igpId,
            requestId: cancelTransactions.requestId,
            command: "TPI_cancelTransactionsAck",
            data:{
                playerId: cancelTransactions.playerId,
                accountId: cancelTransactions.playerId,
                gameSessionId: cancelTransactions.gameSessionId,
                gameCycleId: cancelTransactions.gameCycleId,
                cancelAckArray: [
                    {
                        transSeq: cancelTransactions.transSeq,
                        transId: cancelTransactions.transId,
                        transAmt: operations.convertAmount(cancelTransactions.transAmt,'multiplication'),
                        transType: cancelTransactions.transType,
                        transCategory: cancelTransactions.transCategory,
                        referenceId: cancelTransactions.referenceId,
                        transDay: cancelTransactions.transDay,
                        cancelId: result.p_referenceId,
                        cancelDay: cancelDay,
                        cancelDetailArray:[
                            {
                                balanceType: "cashable",
                                detailAmt: operations.convertAmount(cancelTransactions.transAmt,'multiplication'),
                                detailType: cancelTransactions.transType,
                                balanceAmt: operations.convertAmount(result.p_balance,'multiplication')
                            }
                        ]
                    }
                ],
                accountBalance:{
                    playerId: cancelTransactions.playerId,
                    accountId: cancelTransactions.playerId,
                    currencyCode: global.configMicroservices.currencyCode,
                    messageArray:[],  
                    availBalanceAmt: operations.convertAmount(result.p_balance,'multiplication'),
                    balanceArray:[
                        {
                            balanceType: 'cashable',
                            balanceAmt: operations.convertAmount(result.p_balance,'multiplication')
                        }
                    ]
                }
            }
        }
      };


      customResponse(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, { time2: new Date(), code: 200, message2: cancelTransactionsResp, LogType: 'Rs' });

    } else {
      errors(response, request.method, service, request.path, { time1: startTime, mesage1: request.body, LogType: 'Rq' }, {
        time2: new Date(),
        message2: {
          code: 401,
          errorCode: result.status_code,
          errorMessage: result.status_desc, 
          message: result.status_message, 
          requestId: cancelTransactions.requestId
      }, LogTYpe: 'Rs'});
    }

    

  } catch (err) {
    const errorsObj = JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    errors(response, request.method, service, request.path, {time1: startTime, message1: request.body, LogType: 'Rq' }, {
      time2: new Date(),
      message2: {
        code: 500,
        errorCode: 'IGG_ERR001',
        errorMessage: 'General error.',
        message: errorsObj.message,
        requestId: cancelTransactions.requestId 
      }
    });
  }
};


const cancelGameCycle = async (request, response) => {
  const startTime = new Date();
  const service = 7;

  const cancelGameCycle = {
    rgsId: request.body.request.rgsId,
    igpId: request.body.request.igpId,
    requestId: request.body.request.requestId,
    brandId: request.body.request.data.brandId,
    skinId: request.body.request.data.skinId,
    playerId: request.body.request.data.playerId,
    localeCode: request.body.request.data.localeCode,
    currencyCode: request.body.request.data.currencyCode,
    gameCycleId: request.body.request.data.gameCycleId
};


  cancelGameCycle.activaBono = global.configMicroservices.flagBonoBienvenidaInspired;
  cancelGameCycle.activaBono = (cancelGameCycle.activaBono == (1 || 0)) ? cancelGameCycle.activaBono : 0;

  try {
    const result = await operations.cancelGameCycle(cancelGameCycle.playerId, cancelGameCycle.gameCycleId, cancelGameCycle);

    if (result.status_code == 0) {

      const cancelDay = new Date(Date.now()).toISOString().slice(0, 10);
      const cancelAckArray = result.p_transactionOut.split('##').filter(Boolean).map((transaction, index) => {

        const [transId, transAmt, transType, referenceId, transDate, cancelId, balanceAmt] = transaction.split('@@');
        const transDay = new Date(transDate.split('/')[1]+'/'+transDate.split('/')[0]+'/'+transDate.split('/')[2]).toISOString().slice(0, 10);
          
        return {
              transSeq: index,
              transId,
              transAmt: operations.convertAmount(transAmt, 'multiplication'),
              transType,
              transCategory: 'wager',
              referenceId,
              transDay,
              cancelId,
              cancelDay,
              cancelDetailArray: [
                {
                  balanceType: "cashable",
                  detailAmt: operations.convertAmount(transAmt.replace(',', '.'), 'multiplication'),
                  detailType: transType,
                  balanceAmt: operations.convertAmount(balanceAmt.replace(',', '.'), 'multiplication')
                }
              ]
          };
      });


      const { rgsId, igpId } = global.configMicroservicesinspired.api;
      const { playerId, gameSessionId,requestId,gameCycleId } = cancelGameCycle;

      const cancelGameCycleResp = {
        response:{
            rgsId: rgsId,
            igpId: igpId,
            requestId: requestId,
            command: "TPI_cancelTransactionsAck",
            data:{
                playerId: playerId,
                accountId: playerId,
                gameSessionId: gameSessionId,
                gameCycleId: gameCycleId,
                cancelAckArray: cancelAckArray,
                accountBalance:{
                    playerId: playerId,
                    accountId: playerId,
                    currencyCode: global.configMicroservices.currencyCode,
                    messageArray:[],  
                    availBalanceAmt: operations.convertAmount(result.p_balance,'multiplication'),
                    balanceArray:[
                        {
                            balanceType: 'cashable',
                            balanceAmt: operations.convertAmount(result.p_balance,'multiplication')
                        }
                    ]
                }
            }
        }
      };

      customResponse(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, { time2: new Date(), code: 200, message2: cancelGameCycleResp, LogType: 'Rs' });


    } else {
      errors(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, {
        time2: new Date(),
        message2: {
          code: 401,
          errorCode: result.status_code,
          errorMessage: result.status_desc,
          message: result.status_message,
          requestId: cancelGameCycle.requestId,
        },
        LogType: 'Rs'
      });
    }
    
  } catch (err) {
    const errors = JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    errors(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, {
      time2: new Date(),
      message2: {
        code: 500,
        errorCode: 'IGG_ERR001',
        errorMessage: 'General Error',
        message: errors.message,
        requestId: cancelGameCycle.requestId 
      },
      LogType: 'Rs'
    });
  }
};



const endGameCycle = async (request, response) => {
  const startTime = new Date();
  const service = 8;

  const { rgsId, igpId, requestId, data } = request.body.request;
  const endGameCycle = {
    rgsId,
    igpId,
    requestId,
    ...data
  };

  endGameCycle.activaBono = global.configMicroservices.flagBonoBienvenidaInspired;
  endGameCycle.activaBono = (endGameCycle.activaBono == (1 || 0)) ? endGameCycle.activaBono : 0;

  try {
    const result = await operations.endGameCycle(endGameCycle.playerId, endGameCycle.gameCycleId, endGameCycle.secureToken, endGameCycle.activaBono);

    if (result.status_code == 0) {
      const revenueDay = new Date().toISOString().slice(0, 10);

      const accountBalance = {
        playerId: endGameCycle.playerId,
        accountId: endGameCycle.playerId,
        currencyCode: global.configMicroservices.currencyCode,
        messageArray: [],
        availBalanceAmt: result.p_balance * 100,
        balanceArray: [
          {
            balanceType: 'cashable',
            balanceAmt: result.p_balance * 100
          }
        ]
      };

      const endGameCycleResp = {
        response: {
          rgsId: global.configMicroservicesinspired.api.rgsId,
          igpId: global.configMicroservicesinspired.api.igpId,
          requestId: endGameCycle.requestId,
          command: "TPI_gameSessionAck",
          data: {
            ...endGameCycle,
            revenueDay,
            accountBalance
          }
        }
      };


      customResponse(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, { time2: new Date(), code: 200, message2: endGameCycleResp, LogType: 'Rs' });

    } else {
      errors(response, request.method, service, request.path, {time1: startTime, message1: request.body, LogType: 'Rq'}, { time2: new Date(), message2: {
        code: 401,
        errorCode: result.status_code,
        errorMessage: result.status_desc,
        message: result.status_message,
        requestId: endGameCycle.requestId
      }, LogType: 'Rs' });
    }



  } catch (err) {
    const errors = JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    errors(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, {
      time2: new Date(),
      message2: {
        code: 500,
        errorCode: 'IGG_ERR001',
        errorMessage: 'General error.',
        message: errors.message,
        requestId: endGameCycle.requestId
      }, LogType: 'Rs'
    });
  }

};



const endGameSession = async (request, response) => {
  const startTime = new Date();
  const service = 9;

  const { rgsId, igpId, requestId, data } = request.body.request;
  
  const endGameSession = {
    rgsId,
    igpId,
    requestId,
    brandId: data.brandId,
    skinId: data.skinId,
    playerId: data.playerId,
    localeCode: data.localeCode,
    secureToken: data.secureToken,
    gameSessionId: data.gameSessionId
  };

  endGameSession.activaBono = global.configMicroservices.flagBonoBienvenidaInspired;
  endGameSession.activaBono = (endGameSession.activaBono == (1 || 0)) ? endGameSession.activaBono : 0;


  try {
    const result = await operations.endGameSession(endGameSession.playerId, endGameSession.secureToken, endGameSession.activaBono);

    insertLog(service, request.path, request.method, { time1: startTime, message1: { playerId: endGameSession.playerId, secureToken: endGameSession.secureToken}, LogType: 'Rq'}, { time2: new Date(), message2: result, LogType: 'Rs' });

    if (result.status_code == 0) {

      const endGameSessionResp = {
        response: {
          rgsId: global.configMicroservicesinspired.api.rgsId,
          igpId: global.configMicroservicesinspired.api.igpId,
          requestId: endGameSession.requestId,
          command: "TPI_endGameSessionAck",
          data: {
            secureToken: endGameSession.secureToken,
            gameSessionId: endGameSession.gameSessionId,
            accountBalance: {
              playerId: endGameSession.playerId,
              accountId: endGameSession.playerId,
              currencyCode: global.configMicroservices.currencyCode,
              messageArray: [],
              availBalanceAmt: (result.p_balance) * 100,
              balanceArray: [{
                balanceType: 'cashable',
                balanceAmt: (result.p_balance) * 100
              }]
            }
          }
        }
      };


      customResponse(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, { time2: new Date(), code: 200, message2: endGameSessionResp, LogType: 'Rs' })

    } else {
      errors(response, request.method, service, request.path, {time1: startTime, message1: request.body, LogType: 'Rs' }, 
          { time2: new Date(), 
            message2: {
              code: 401,
              errorCode: result.status_code,
              errorMessage: result.status_desc,
              message: result.status_message,
              requestId: endGameSession.requestId
            }, 
            LogType: 'Rs'
          });
    }
    
  } catch (err) {
    const errors = JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    errors(response, request.method, service, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, { time2: new Date(),
        message2: {
          code: 500,
          errorCode: 'IGG_ERR001',
          errorMessage: 'General error.',
          message: errors.message,
          questId: endGameSession.requestId
        },
        LogType: 'Rs'
      });
  }

};


const general = async (request, response) => {
  const startTime = new Date();

  const commands = {
    TPI_verifyPlayerSession: async () => await verifyPlayerSession(request, response),
    TPI_startGameSession: async () => await startGameSession(request, response),
    TPI_getPlayerBalance: async () => await getPlayerBalance(request, response),
    TPI_startGameCycle: async () => await startGameCycle(request, response),
    TPI_moneyTransactions: async () => await moneyTransactions(request, response),
    TPI_cancelTransactions: async () => await cancelTransactions(request, response),
    TPI_cancelGameCycle: async () => await cancelGameCycle(request, response),
    TPI_endGameCycle: async () => await endGameCycle(request, response),
    TPI_endGameSession: async () => await endGameSession(request, response)
  };

  const { command } = request.body.request;

  try {
    
    commands[command]();

  } catch (error) {
    errors(response, request.method, 0, request.path, { time1: startTime, message1: request.body, LogType: 'Rq' }, { time2: new Date(), message2: { requestId: request.body.requestId, statusCode: 'IGG_ERR002', statusMessage: 'General error. Internal server error'}, LogType: 'Rs' });
  }
};


module.exports = { 
  launchGame, 
  general, 
  verifyPlayerSession, 
  startGameSession, 
  getPlayerBalance, 
  startGameCycle, 
  moneyTransactions, 
  cancelTransactions, 
  cancelGameCycle,
  endGameCycle,
  endGameSession
};