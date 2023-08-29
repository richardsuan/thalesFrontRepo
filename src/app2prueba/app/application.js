'use strict';

require('./common/lib/secure-config/global-conf');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, authorization');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE');
    next();
});

//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json({ limit: '6mb' }));
//app.use(bodyParser.json());

app.use(function(req, res, next) {
    var data = "";
    req.on('data', function(chunk) {
        //console.log(chunk);
        data += chunk;
        req.rawBody = data;
        req.body = JSON.parse(data);
        //console.log(req.body);
    })

    req.on('end', function(chunk) {
        next();
    })
})

module.exports = app;