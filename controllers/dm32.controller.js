'use strict';

var request = require('request');
var util 	= require('./util/utils');
var proxymw = require('http-proxy-middleware');

var Dm32Controller = function(sockCtl, app){
	var _this = this;

	var connectedDm32s 		= [];
	var deviceTypes 		= util.getJsonFromFile('/../../data/devices.json').devices;
	var primaryFanIndex 	= 0;

	// exposed methods
	_this.listConnectedDevices 	= listConnectedDevices;
	_this.listDeviceTypes 		= listDeviceTypes;
	_this.addDm32 				= addDm32;
	_this.removeDm32 			= removeDm32;
	_this.sendPoint				= sendPoint;
	_this.updateTestStatus 		= updateTestStatus;

	  
	// send list of connected fans to UI
	function listConnectedDevices(req, res) {
		if (connectedDm32s.length < 1) {
			util.sendJsonResponse(res, 404, 
				{'message': 'No DM32s were discovered. Please make sure the VFD for each module is powered up and you are connected to the network.'});
			return;
		} else {
			util.sendJsonResponse(res, 200, {list: connectedDm32s});
		}
	}

	// send list of device types to UI
	function listDeviceTypes(req, res) {
		if (deviceTypes.length < 1) {
			util.sendJsonResponse(res, 404, 
				{'message': 'No device types were discovered.'});
			return;
		} else {
			util.sendJsonResponse(res, 200, {list: deviceTypes});
		}
	}

	function addDm32(info) {
		var dm32Index = util.indexOf(connectedDm32s, 'name', info.name);

		if (dm32Index === -1) {
			var deviceIndex 	= util.indexOf(deviceTypes, 'index', parseInt(info.model,10));
			var device 			= deviceTypes[deviceIndex]; 
			var range 			= device.ranges[info['range'] - 1];
			var coefficients 	= device.coefficients[range];
			var url		 		= 'http://' + info['ip'] + ':3000/' + info['name'] + '/api';

			var newDm32 = {
				name		: info['name'],
				url 		: url,
				model 		: device.model,
				range		: range,
				avgInterval	: parseInt(info['avg_interval'], 10),
				coeffs 		: coefficients,
				isPrimary  	: false
			}

			connectedDm32s.push(newDm32);

			// add proxy to dm32
			var context = '/' + newDm32.name + '/api';
			var options = {
		        target: 'http://' + info['ip'] + ':3000', 
		        pathRewrite: {
		            '^/tesla-\\d+/api' : '/api'       
		        }
		    };

			var proxy = proxymw(context, options);
			app.use(proxy);

			// let the web app know there is a new fan connected
			sockCtl.appSocket.emit('new-fan', newDm32);
		} 
	}

	function updateDm32(newDm32) {
		var dm32Index = util.indexOf(connectedDm32s, 'name', info.name);
		
		if (dm32Index !== -1) {
			connectedDm32s[dm32Index] = newDm32;
			newDm32.isPrimary && (primaryFanIndex = dm32Index);
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

	// send data point to web app
	function sendPoint(data) {
		var point = {
			envelopeDP	: data['envelope_dp'],
			fanDP		: data['fan_dp'],
			fanSpeed	: data['fan_speed'],
			capture 	: data['capture'],
			target		: data['target'],
			fan 		: data['name']
		};

		sockCtl.appSocket.emit('dataAvailable', point);
	}

	// send status update to web app
	function updateTestStatus(status) {
		sockCtl.appSocket.emit('statusUpdate', status);
	}
}

module.exports = Dm32Controller;