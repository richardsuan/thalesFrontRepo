"use strict";

const { Router } = require('express');

const { authenticated } = require('../common/middlewares/authenticated');
const { general, launchGame } = require('./inspired.controller');
const { validateLaunchGame, validate } = require('./inspired.validations');



const router = Router();


router.post('/accounts/me/game-launch-url', authenticated, validateLaunchGame, launchGame);
router.post('/inspired', validate, general);


module.exports = router;