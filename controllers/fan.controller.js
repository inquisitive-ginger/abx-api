'use strict';

var _ = require('underscore');

// container for storing connected fan information
var fans = [];

// start mDNS browser to look for connected fan modules
module.exports.initializeMdns = function initializeMdns() {
	var mdns = require('mdns');
	var browser = mdns.createBrowser(mdns.tcp('http'));

	browser.on('serviceUp', function(service){addFan(service)});
	browser.on('serviceDown', function(service){removeFan(service)});
	browser.start();
}

// Check if 'service up' signal was a fan and add it to the list
function addFan(service) {
	//console.log("Fan online: ", service);
	var fanPattern = /^tesla-\d+$/;
	var index = indexOf(fans, 'name', service.name);
	if(service.name.match(fanPattern) && index === -1){
		var fan = {
			name: service.name,
			host: service.host,
			ip: service.addresses[0],
			port: service.port
		};
		fans.push(fan);

		// tell client there is a new fan available
		if(global.socketController.io) {
			socketController.io.emit('new-fan', fan);
		}
	}
}

// Check if 'service down' signal was a fan and remove it from the list
function removeFan(service) {
	//console.log("Fan offline: ", service);
	var index = indexOf(fans, 'name', service.name);
	if (index !== -1) {
		fans.splice(index, 1);
	}
}

module.exports.checkFanConnection = function (req, res) {
	var index = indexOf(fans, 'name', req.params.name);
	if (index === -1) {
		sendJsonResponse(res, 404, {'connected': false});
	} else {
		sendJsonResponse(res, 200, {'connected': true});
	}
};
  
// send back list of fans to UI
module.exports.listFans = function (req, res) {
	if (fans.length < 1) {
		sendJsonResponse(res, 404, 
			{'message': 'No fans were discovered. Please make sure the VFD for each module is powered up and you are connected to the network.'})
		return;
	} else {
		sendJsonResponse(res, 200, {fans: fans});
	}
}

// helper for sending back JSON result objects
function sendJsonResponse(res, status, content) {
	res.status(status);
	res.json(content);
};

// helper to return index of object in array
function indexOf(arr, param, value) {
	return _.chain(arr).pluck(param).indexOf(value).value();
}