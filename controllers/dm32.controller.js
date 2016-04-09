'use strict';

var request 		= require('request');
var util 			= require('./util/utils');

var Dm32Controller = function(sockCtl){
	var _this = this;

	var connectedDm32s 	= [];
	var deviceTypes 	= util.getJsonFromFile('/../../data/devices.json').devices;

	// exposed methods
	_this.listConnectedDevices 	= listConnectedDevices;
	_this.addDm32 				= addDm32;
	_this.removeDm32 			= removeDm32;

	  
	// send back list of fans to UI
	function listConnectedDevices(req, res) {
		if (connectedDm32s.length < 1) {
			util.sendJsonResponse(res, 404, 
				{'message': 'No DM32s were discovered. Please make sure the VFD for each module is powered up and you are connected to the network.'});
			return;
		} else {
			util.sendJsonResponse(res, 200, {list: connectedDm32s});
		}
	}

	function addDm32(info) {
		var dm32Index = util.indexOf(connectedDm32s, 'name', info.name);
		var deviceIndex = util.indexOf(deviceTypes, 'index', parseInt(info.model,10));
		var device = deviceTypes[deviceIndex]; 

		if (dm32Index === -1) {
			var newDm32 = {
				name: info['name'],
				ip: info['ip'],
				model: device.model,
				ranges: device.ranges,
				range: device.ranges[info['range'] - 1],
				avgInterval: info['avg_interval']
			}

			connectedDm32s.push(newDm32);

			// let the web app know there is a new fan
			sockCtl.appSocket.emit('new-fan', newDm32);
		}
	}

	function removeDm32(name) {
		var dm32Index = util.indexOf(connectedDm32s, 'name', name);

		if (dm32Index !== -1) {
			connectedDm32s.splice(dm32Index, 1);

			// let the web app know a fan has been removed
			sockCtl.appSocket.emit('fan-removed', {name: name});
		}
	}
}

module.exports = Dm32Controller;







