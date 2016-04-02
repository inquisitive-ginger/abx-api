'use strict;'

var express = require('express');
var router = express.Router();

// register specific controllers
var fanCtrl = require('../controllers/fan.controller'); 
fanCtrl.initializeMdns();

var resultsCtrl = require('../controllers/results.controller');

// api routes
router.get('/fans', fanCtrl.listFans);
router.get('/fans/:name', fanCtrl.checkFanConnection);
router.post('/results', resultsCtrl.results);

module.exports = router;