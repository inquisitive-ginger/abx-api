'use strict;'

var express = require('express');
var router = express.Router();

// routes
router.get('/devices/connected', global.dm32Manager.listConnectedDevices);
router.get('/devices/type', global.dm32Manager.listDeviceTypes);

module.exports = router;