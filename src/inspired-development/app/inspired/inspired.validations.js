"use strict";

const Joi = require("joi");
const operations = require('./inspired.operations')

const { jsonErrorResponse } = require('../common/response.management');

const commands = [
  'TPI_verifyPlayerSession',
  'TPI_startGameSession',
  'TPI_getPlayerBalance',
  'TPI_startGameCycle',
  'TPI_moneyTransactions',
  'TPI_cancelTransactions',
  'TPI_cancelGameCycle',
  'TPI_endGameCycle',
  'TPI_endGameSession'
];




// Funcion auxiliar para retornar el error del brandId
const validateBrandId = (res, req, startTime, errorMessage) => {
  jsonErrorResponse(res, req.method, 1, req.path, { time1: startTime, message1: req.body.request, LogType: 'Rq'},
  { time2: new Date(), code: 400, message2: { error: 'ERR020', description: errorMessage }, LogType: 'Rs'});
}


// Funcion auxiliar para retornar el error del skinId
const validateSkinId = (res, req, startTime, errorMessage) => {
  jsonErrorResponse(res, req.method, 1, req.path, { time1: startTime, message1: req.body.request, LogType: 'Rq'},
  { time2: new Date(), code: 400, message2: { error: 'ERR021', description: errorMessage }, LogType: 'Rs'});
};


// Funcion auxiliar para retornar el error del secureToken
const validateSecureToken = (res, req, startTime, errorMessage) => {
  jsonErrorResponse(res, req.method, 1, req.path, { time1: startTime, message1: req.body.request, LogType: 'Rq'},
  { time2: new Date(), code: 400, message2: { error: 'ERR022', description: errorMessage }, LogType: 'Rs'});
};


// Funcion para retornar el error de tipado en el body
const validateOther = (res, req, startTime, errorMessage) => {
  jsonErrorResponse(res, req.method, 1, req.path, { time1: startTime, message1: req.body.request, LogType: 'Rq'},
  { time2: new Date(), code: 400, message2: { error: 'IGG_ERR001', description: errorMessage }, LogType: 'Rs'});
}




//? middleware de validacion LaunchGame
const validateLaunchGame = (req, res, next) => {


      //? Esquema de validacion endpoint "URL - Launch Game"
    const launchGameSchema = Joi.object({
      gameCode: Joi.string().required()
    });


  const startTime = new Date();

  const { error } = launchGameSchema.validate(req.body, { abortEarly: true });

  if (error) {
    jsonErrorResponse(res, req.method, 0, req.path, { time1: startTime, message1: req.body, LogType: 'Rq'}, { time2: new Date(), code: 400, message2: { error: 'IGG_ERR001', description: error.details[0].message }, LogType: 'Rs'} );

  } else {
    next();
  }
};



//? Middleware que valida el endpoint "inspired"
const validate = async (req, res, next) => {


      //? Validacion rgsId

    const rgsId = Joi.string()
    .max(32).required()
    .valid([global.configMicroservicesinspired.api.rgsId]);


    //? Validacion igpId

    const igpId = Joi.string()
    .max(32)
    .required()
    .valid([global.configMicroservicesinspired.api.igpId]);


    //? Validaciones requestId

    const requestId = Joi.string()
    .max(36)
    .required();


    //? validaciones command
    const command = Joi.string()
    .max(64)
    .required()
    .valid(commands);


    //? validaciones brandId
    const brandId = Joi.string()
    .max(32)
    .required()
    .valid([global.configMicroservicesinspired.api.brandId]);


    //? validaciones skinId
    const skinId = Joi.string()
    .max(32)
    .required()
    .valid([global.configMicroservicesinspired.api.skinId]);


    //? validaciones gameId
    const gameId = Joi.string()
    .max(64)
    .required();


    //? validaciones channelType
    const channelType = Joi.string()
    .max(32)
    .required();


    //? validaciones presentType
    const presentType = Joi.string()
    .max(32)
    .required();


    //? validaciones secureToken
    const secureToken = Joi.string()
    .max(64)
    .required();


    //? validaciones playerId
    const playerId = Joi.string()
    .max(32)
    .required();


    //? validaciones accountId
    const accountId = Joi.string()
    .max(32)
    .required();


    //? validaciones localeCode
    const localeCode = Joi.string()
    .max(5)
    .required();


    //? validaciones currencyCode
    const currencyCode = Joi.string()
    .max(3)
    .required();


    //? validaciones includePlayerInfo
    const includePlayerInfo = Joi.boolean();


    //? validaciones gameSessionId
    const gameSessionId = Joi.string()
    .max(36)
    .required();


    //? validaciones gameType
    const gameType = Joi.string()
    .required();


    //? validaciones mfgCode
    const mfgCode = Joi.string()
    .required();


    //? validaciones themeId
    const themeId = Joi.string()
    .required();


    //? validaciones paytableId
    const paytableId = Joi.string()
    .required();


    //? validaciones betConfigId
    const betConfigId = Joi.string()
    .required();


    //? validaciones IGG_sugGameId
    const IGG_subGameId = Joi.string()
    .max(64);


    //? validaciones gameCycleId
    const gameCycleId = Joi.string()
    .max(36)
    .required();


    //? validaciones transSeq
    const transSeq = Joi.number()
    .min(1)
    .integer()
    .required();


    //? validaciones transId
    const transId = Joi.string()
    .max(36)
    .required();


    //? validaciones transAmt
    const transAmt = Joi.number()
    .integer()
    .required();


    //? validaciones transType
    const transType = Joi.string()
    .valid(['debit', 'credit', 'special'])
    .required();


    //? validaciones transCategory
    const transCategory = Joi.string()
    .valid(['wager', 'win', 'progWin', 'progContrib'])
    .required();


    //? validaciones freeSpinId
    const freeSpinId = Joi.string()
    .max(36);


    //? validaciones betTypeId
    const betTypeId = Joi.string()
    .max(16)
    .required();


    //? validaciones betTypeDescription
    const betTypeDescription = Joi.string()
    .max(64)
    .required();


    //? validaciones betSelectionId
    const betSelectionId = Joi.string()
    .max(50)
    .required();


    //? validaciones betSelectionDescription
    const betSelectionDescription = Joi.string()
    .max(200)
    .required();


    //? validaciones odds
    const odds = Joi.number()
    .required();


    //? validaciones channelName
    const channelName = Joi.string()
    .max(256)
    .required();


    //? validaciones homeTeam
    const homeTeam = Joi.string()
    .max(256);


    //? validaciones awayTeam
    const awayTeam = Joi.string()
    .max(256);


    //? validaciones timestamp
    const timestamp = Joi.string()
    .isoDate()
    .required();


    //? validaciones gameCycleExc
    const gameCycleExc = Joi.number()
    .integer()
    .valid([1, 0]);


    //? validaciones gameSessionExc
    const gameSessionExc = Joi.number()
    .integer()
    .valid([0, 1, 2]);



    //? Validaciones de eachWayRatio
    const eachWayRatio = Joi.string();


    //? Validaciones de racerName
    const racerName = Joi.string();


    //? validaciones de referenceId
    const referenceId = Joi.string().max(36).required();


    //? validaciones de transDay
    const transDay = Joi.string().max(10).required();


        //? Esquema de validacion del metodo verifPLayerSession
    const TPI_verifyPlayerSessionSchema = Joi.object({
      request: Joi.object({
        rgsId,
        igpId,
        requestId,
        command,
        data: Joi.object({
          brandId,
          skinId,
          gameId,
          channelType,
          presentType,
          secureToken,
          playerId,
          accountId,
          localeCode,
          currencyCode,
          includePlayerInfo
        }).required(),
      }).required(),
    });


    //? Esquema de validacion del metodo startGameSession
    const TPI_startGameSessionSchema = Joi.object({
      request: Joi.object({
        rgsId,
        igpId,
        requestId,
        command,
        data: Joi.object({
          brandId,
          skinId,
          gameId,
          channelType,
          presentType,
          secureToken,
          playerId,
          accountId,
          localeCode,
          currencyCode,
          gameSessionId,
          gameType,
          mfgCode,
          themeId,
          paytableId,
          betConfigId
        }).required()
      }).required()
    });



    //? Esquema de validacion del metodo getPlayerBalanceS
    const TPI_getPlayerBalanceSchema = Joi.object({
      request: Joi.object({
        rgsId,
        igpId,
        requestId,
        command,
        data: Joi.object({
          secureToken,
          playerId,
          accountId,
          brandId,
          skinId,
          localeCode,
        }).required()
      }).required()
    });



    //? Esquema de validacion del metodo startGameCycle
    const TPI_startGameCycleSchema = Joi.object({
      request: Joi.object({
        rgsId,
        igpId,
        requestId,
        command,
        data: Joi.object({
          secureToken,
          playerId,
          accountId,
          gameSessionId,
          currencyCode,
          brandId,
          skinId,
          localeCode,
          gameCycleId,
          IGG_subGameId,
        }).required()
      }).required()
    });



    //? Esquema de validacion del metodo moneyTransactions
    const moneyTransArrayObject = Joi.object({
      transSeq,
      transId,
      transAmt,
      transType,
      transCategory,
      freeSpinId,
      IGG_vppBetDetail: Joi.object({
        betTypeId,
        betTypeDescription,
        betSelectionId,
        betSelectionDescription,
        odds,
        eachWayRatio,
        event: Joi.object({
          channelType,
          channelName,
          homeTeam,
          awayTeam,
          racerName,
          timestamp
        }).required()
      })
    });

    const TPI_moneyTransactionsSchema = Joi.object({
      request: Joi.object({
        rgsId,
        igpId,
        requestId,
        command,
        data: Joi.object({
          secureToken,
          playerId,
          accountId,
          gameSessionId,
          currencyCode,
          brandId,
          skinId,
          localeCode,
          gameCycleId,
          gameCycleExc,
          moneyTransArray: Joi.array().items(moneyTransArrayObject).required()
        }).required()
      }).required()
    });



    //? Esquema de validacion de metodo cancelTransactions
    const cancelTransArrayObject = Joi.object({
      transSeq,
      transId,
      transAmt,
      transType,
      transCategory,
      freeSpinId,
      referenceId,
      transDay,
    });


    const TPI_cancelTransactionsSchema = Joi.object({
      request: Joi.object({
        rgsId,
        igpId,
        requestId,
        command,
        data: Joi.object({
          secureToken,
          playerId,
          accountId,
          gameSessionId,
          currencyCode,
          brandId,
          skinId,
          localeCode,
          gameCycleId,
          cancelTransArray : Joi.array().items(cancelTransArrayObject).required(),
        }).required()
      }).required()
    });


    //? Esquema de validacion de metodo cancelGameCycle
    const TPI_cancelGameCycleSchema = Joi.object({
      request: Joi.object({
        rgsId,
        igpId,
        requestId,
        command,
        data: Joi.object({
          secureToken: Joi.string().max(64),
          playerId,
          accountId,
          gameSessionId,
          currencyCode,
          brandId,
          skinId,
          localeCode,
          gameCycleId,
          gameCycleExc,
        }).required()
      }).required()
    });


    //? Esquema de validacion del metodo endGameCycle
    const TPI_endGameCycleSchema = Joi.object({
      request: Joi.object({
        rgsId,
        igpId,
        requestId,
        command,
        data: Joi.object({
          secureToken: Joi.string().max(64),
          playerId,
          accountId,
          gameSessionId,
          gameCycleId,
          currencyCode,
          brandId,
          skinId,
          localeCode,
          gameCycleExc
        }).required()
      }).required()
    });


    //? Esquema de validacion del metodo endGameSession
    const TPI_endGameSessionSchema = Joi.object({
      request: Joi.object({
        rgsId,
        igpId,
        requestId,
        command,
        data: Joi.object({
          secureToken: Joi.string().max(64),
          playerId,
          accountId,
          gameSessionId,
          brandId,
          skinId,
          localeCode,
          gameSessionExc,
        }).required()
      }).required()
    });




  const startTime = new Date();

  const { request } = req.body;


  if (!commands.includes(request.command)) {
    jsonErrorResponse(res, req.method, 1, req.path, { time1: startTime, message1: request, LogType: 'Rq'}, { time2: new Date(), code: 400, message2:
      { error: 'ERR035', description: 'Command invalid or not sent.' }, LogType: 'Rs'});
  }


  if (request.command == 'TPI_verifyPlayerSession') {

    const { error } = TPI_verifyPlayerSessionSchema.validate(req.body, { abortEarly: true });

    if (error) {
      const errorMessage = error.details[0].message;

      if (errorMessage.includes('brandId')) { validateBrandId(res, req, startTime, errorMessage);  } else
      if (errorMessage.includes('skinId')) { validateSkinId(res, req, startTime, errorMessage); } else
      if (errorMessage.includes('secureToken')) { validateSecureToken(res, req, startTime, errorMessage); } else {
        validateOther(res, req, startTime, errorMessage);
      }

    } else {

      const gameId = operations.searchGame(request.data.gameId);

      if (gameId === null) return validateOther(res, req, startTime, 'Game not found or disabled');

      const { p_currency_code, p_country_code, p_language_code} = await operations.getUserData(request.data.playerId, gameId[0], global.configMicroservices.flagPlatform);
      const localCode = `${p_language_code}-${p_country_code}`;

      if (p_language_code === null || p_country_code === null || p_currency_code === null)
      return validateOther(res, req, startTime, 'Information not found. User not found');


      if (request.data.localeCode !== localCode) return validateOther(res, req, startTime, `localCode invalid. suggested value ${localCode}`);
      if (request.data.currencyCode !== p_currency_code) return validateOther(res, req, startTime, `currencyCode invalid. suggested value ${p_currency_code}`);

      next();
    }













  } else if (request.command == 'TPI_startGameSession') {

    const { error } = TPI_startGameSessionSchema.validate(req.body, { abortEarly: true });

    if (error) {
      const errorMessage = error.details[0].message;

      if (errorMessage.includes('brandId')) { validateBrandId(res, req, startTime, errorMessage);  } else
      if (errorMessage.includes('skinId')) { validateSkinId(res, req, startTime, errorMessage); } else
      if (errorMessage.includes('secureToken')) { validateSecureToken(res, req, startTime, errorMessage); } else {
        validateOther(res, req, startTime, errorMessage);
      }

    } else {

      const gameId = operations.searchGame(request.data.gameId);

      if (gameId === null) return validateOther(res, req, startTime, 'Game not found or disabled');

      const { p_currency_code, p_country_code, p_language_code} = await operations.getUserData(request.data.playerId, gameId[0], global.configMicroservices.flagPlatform);
      const localCode = `${p_language_code}-${p_country_code}`;

      if (p_language_code === null || p_country_code === null || p_currency_code === null)
      return validateOther(res, req, startTime, 'Information not found. User not found');


      if (request.data.localeCode !== localCode) return validateOther(res, req, startTime, `localCode invalid. suggested value ${localCode}`);
      if (request.data.currencyCode !== p_currency_code) return validateOther(res, req, startTime, `currencyCode invalid. suggested value ${p_currency_code}`);

      next();
    }











  } else if (request.command == 'TPI_getPlayerBalance') {

    const { error } = TPI_getPlayerBalanceSchema.validate(req.body, { abortEarly: true });

    if (error) {
      const errorMessage = error.details[0].message;

      if (errorMessage.includes('brandId')) { validateBrandId(res, req, startTime, errorMessage);  } else
      if (errorMessage.includes('skinId')) { validateSkinId(res, req, startTime, errorMessage); } else
      if (errorMessage.includes('secureToken')) { validateSecureToken(res, req, startTime, errorMessage); } else {
        validateOther(res, req, startTime, errorMessage);
      }

    } else {
      const { p_country_code, p_language_code} = await operations.getUserDataForToken(request.data.playerId, request.data.secureToken);
      const localCode = `${p_language_code}-${p_country_code}`;

      if (p_language_code === null || p_country_code === null)
      return validateOther(res, req, startTime, 'Information not found. User not found');


      if (request.data.localeCode !== localCode) return validateOther(res, req, startTime, `localCode invalid. suggested value ${localCode}`);

      next();
    }










  } else if (request.command == 'TPI_startGameCycle') {

    const { error } = TPI_startGameCycleSchema.validate(req.body, { abortEarly: true });

    if (error) {
      const errorMessage = error.details[0].message;

      if (errorMessage.includes('brandId')) { validateBrandId(res, req, startTime, errorMessage);  } else
      if (errorMessage.includes('skinId')) { validateSkinId(res, req, startTime, errorMessage); } else
      if (errorMessage.includes('secureToken')) { validateSecureToken(res, req, startTime, errorMessage); } else {
        validateOther(res, req, startTime, errorMessage);
      }

    } else {
      const { p_country_code, p_language_code, p_currency_code} = await operations.getUserDataForToken(request.data.playerId, request.data.secureToken);
      const localCode = `${p_language_code}-${p_country_code}`;

      if (p_language_code === null || p_country_code === null || p_currency_code === null)
      return validateOther(res, req, startTime, 'Information not found. User not found');


      if (request.data.localeCode !== localCode) return validateOther(res, req, startTime, `localCode invalid. suggested value ${localCode}`);
      if (request.data.currencyCode !== p_currency_code) return validateOther(res, req, startTime, `currencyCode invalid. suggested value ${p_currency_code}`);


      next();
    }













  } else if (request.command == 'TPI_moneyTransactions') {

    const { error } = TPI_moneyTransactionsSchema.validate(req.body, { abortEarly: true });

    if (error) {
      const errorMessage = error.details[0].message;

      if (errorMessage.includes('brandId')) { validateBrandId(res, req, startTime, errorMessage);  } else
      if (errorMessage.includes('skinId')) { validateSkinId(res, req, startTime, errorMessage); } else
      if (errorMessage.includes('secureToken')) { validateSecureToken(res, req, startTime, errorMessage); } else {
        validateOther(res, req, startTime, errorMessage);
      }

    } else {
      const { p_country_code, p_language_code, p_currency_code} = await operations.getUserDataForToken(request.data.playerId, request.data.secureToken);
      const localCode = `${p_language_code}-${p_country_code}`;

      if (p_language_code === null || p_country_code === null || p_currency_code === null)
      return validateOther(res, req, startTime, 'Information not found. User not found');


      if (request.data.localeCode !== localCode) return validateOther(res, req, startTime, `localCode invalid. suggested value ${localCode}`);
      if (request.data.currencyCode !== p_currency_code) return validateOther(res, req, startTime, `currencyCode invalid. suggested value ${p_currency_code}`);


      next();
    }











  }else if (request.command == 'TPI_cancelTransactions') {

    const { error } = TPI_cancelTransactionsSchema.validate(req.body, { abortEarly: true });

    if (error) {
      const errorMessage = error.details[0].message;

      if (errorMessage.includes('brandId')) { validateBrandId(res, req, startTime, errorMessage);  } else
      if (errorMessage.includes('skinId')) { validateSkinId(res, req, startTime, errorMessage); } else
      if (errorMessage.includes('secureToken')) { validateSecureToken(res, req, startTime, errorMessage); } else {
        validateOther(res, req, startTime, errorMessage);
      }

    } else {
      const { p_country_code, p_language_code, p_currency_code} = await operations.getUserDataForToken(request.data.playerId, request.data.secureToken);
      const localCode = `${p_language_code}-${p_country_code}`;

      if (p_language_code === null || p_country_code === null || p_currency_code === null)
      return validateOther(res, req, startTime, 'Information not found. User not found');


      if (request.data.localeCode !== localCode) return validateOther(res, req, startTime, `localCode invalid. suggested value ${localCode}`);
      if (request.data.currencyCode !== p_currency_code) return validateOther(res, req, startTime, `currencyCode invalid. suggested value ${p_currency_code}`);


      next();
    }











  } else if (request.command == 'TPI_cancelGameCycle') {

    const { error } = TPI_cancelGameCycleSchema.validate(req.body, { abortEarly: true});

    if (error) {
      const errorMessage = error.details[0].message;

      if (errorMessage.includes('brandId')) { validateBrandId(res, req, startTime, errorMessage);  } else
      if (errorMessage.includes('skinId')) { validateSkinId(res, req, startTime, errorMessage); } else
      if (errorMessage.includes('secureToken')) { validateSecureToken(res, req, startTime, errorMessage); } else {
        validateOther(res, req, startTime, errorMessage);
      }

    } else {
      const { p_country_code, p_language_code, p_currency_code} = await operations.getUserDataForToken(request.data.playerId, request.data.secureToken);
      const localCode = `${p_language_code}-${p_country_code}`;

      if (p_language_code === null || p_country_code === null || p_currency_code === null)
      return validateOther(res, req, startTime, 'Information not found. User not found');


      if (request.data.localeCode !== localCode) return validateOther(res, req, startTime, `localCode invalid. suggested value ${localCode}`);
      if (request.data.currencyCode !== p_currency_code) return validateOther(res, req, startTime, `currencyCode invalid. suggested value ${p_currency_code}`);


      next();
    }











  } else if (request.command == 'TPI_endGameCycle') {

    const { error } = TPI_endGameCycleSchema.validate(req.body, { abortEarly: true });

    if (error) {
      const errorMessage = error.details[0].message;

      if (errorMessage.includes('brandId')) { validateBrandId(res, req, startTime, errorMessage);  } else
      if (errorMessage.includes('skinId')) { validateSkinId(res, req, startTime, errorMessage); } else
      if (errorMessage.includes('secureToken')) { validateSecureToken(res, req, startTime, errorMessage); } else {
        validateOther(res, req, startTime, errorMessage);
      }

    } else {
      const { p_country_code, p_language_code, p_currency_code} = await operations.getUserDataForToken(request.data.playerId, request.data.secureToken);
      const localCode = `${p_language_code}-${p_country_code}`;

      if (p_language_code === null || p_country_code === null || p_currency_code === null)
      return validateOther(res, req, startTime, 'Information not found. User not found');


      if (request.data.localeCode !== localCode) return validateOther(res, req, startTime, `localCode invalid. suggested value ${localCode}`);
      if (request.data.currencyCode !== p_currency_code) return validateOther(res, req, startTime, `currencyCode invalid. suggested value ${p_currency_code}`);


      next();
    }








    

  } else if (request.command == 'TPI_endGameSession') {

    const { error } = TPI_endGameSessionSchema.validate(req.body, { abortEarly: true });

    if (error) {
      const errorMessage = error.details[0].message;

      if (errorMessage.includes('brandId')) { validateBrandId(res, req, startTime, errorMessage);  } else
      if (errorMessage.includes('skinId')) { validateSkinId(res, req, startTime, errorMessage); } else
      if (errorMessage.includes('secureToken')) { validateSecureToken(res, req, startTime, errorMessage); } else {
        validateOther(res, req, startTime, errorMessage);
      }

    } else {
      const { p_country_code, p_language_code} = await operations.getUserDataForToken(request.data.playerId, request.data.secureToken);
      const localCode = `${p_language_code}-${p_country_code}`;

      if (p_language_code === null || p_country_code === null)
      return validateOther(res, req, startTime, 'Information not found. User not found');


      if (request.data.localeCode !== localCode) return validateOther(res, req, startTime, `localCode invalid. suggested value ${localCode}`);

      next();
    }

  }


};


module.exports = { validateLaunchGame, validate };