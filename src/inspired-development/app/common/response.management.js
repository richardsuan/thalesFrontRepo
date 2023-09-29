'use strict';

const { insertLog } = require('./logger');


const customResponse = (response, method, service, url, inputData, outputData) => {
  insertLog(service, url, method, inputData, outputData);
  return response.status(outputData.code).send(outputData.message2);
};

const errors = (response, method, service, url, inputData, outputData) => {
  insertLog(service, url, method, inputData, outputData);
  return response.status(outputData.message2.code).send({
      error: outputData.message2.errorCode,
      description: outputData.message2.errorMessage
  });
};

const authErrorResponse = (response, method, service, url, inputData, outputData) => {
  insertLog(service, url, method, inputData, outputData);
  return response.status(outputData.code).send(outputData.message2);
};

const jsonErrorResponse = (response, method, service, url, inputData, outputData) => {
  insertLog(service, url, method, inputData, outputData);
  return response.status(outputData.code).send(outputData.message2);
};


module.exports = { customResponse, errors, authErrorResponse, jsonErrorResponse };