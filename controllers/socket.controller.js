'use strict';

var util = require('./util/utils')
var SocketController = function(server) {
	var _this = this;

	var io = require('socket.io')(server);

	_this.dm32Socket = io
		.of('/dm32')
		.on('connection', function(socket){
			var dm32 = util.jsonifyQuery(socket.request._query.dm32);

			global.dm32Manager.addDm32(dm32);

			socket.on('disconnect', function(){
				global.dm32Manager.removeDm32(dm32.name);
			});

			socket.on('dataPointAvailable', global.dm32Manager.sendPoint);
			socket.on('statusUpdate', global.dm32Manager.updateTestStatus);
		});

	_this.appSocket = io
		.of('/api')
		.on('connection', function(socket){
			console.log('Web app connected!');

			socket.emit('sendIP', {ip: require('ip').address()});
		})
}

module.exports = SocketController;