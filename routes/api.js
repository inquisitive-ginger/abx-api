'use strict;'

var express = require('express');
var router = express.Router();

// routes
router.get('/devices', global.dm32Manager.listConnectedDevices);
router.post('/results', global.results.results);

module.exports = router;