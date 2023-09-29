'use strict';

const { authErrorResponse } = require('../response.management');
const { verifyAuth } = require('../jwt.funcs');

const authenticated = async (req, res, next) => {
  const timeRq = new Date();
  let token = req.headers.authorization;

  if (token) token = token.replace('Bearer ', '');
  
  const decoded = await verifyAuth(token);

  if (decoded.status == 1) {
    req.tokenData = decoded.data;
    next();

  } else {
    return authErrorResponse(res, req.method, 4, req.path, { time1: timeRq, message1: { authorization: req.headers.authorization, body: req.body }, LogType1: 'Rq' }, { time2: new Date(), code: 401, message2: { error: decoded.error, message: decoded.message}, LogType2: 'Rs' });
  }
};

module.exports = { authenticated };
