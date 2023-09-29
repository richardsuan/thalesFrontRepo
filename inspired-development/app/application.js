"use strict";


const express = require("express");
const cors = require("cors");

const { jsonErrorResponse } = require('./common/response.management');
require('./common/lib/secure-config/global-conf');


// creamos la app express
const app = express();
const inspiredRouter = require('./inspired/inspired.router');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(function(err, req, res, next) {

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      const message = {
          error: 7,
          description: "Bad parameters in the request"
      };

      jsonErrorResponse(res, req.method, 3, req.path, { time1: new Date(), message1: { body: err.body }, LogType1: 'Rq' }, { time2: new Date(), code: 400, message2: message, LogType2: 'Rs' });
  };
});

app.use(inspiredRouter);


module.exports = app;

