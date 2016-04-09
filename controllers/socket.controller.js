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
							})
						});

	_this.appSocket = io
						.of('/api')
						.on('connection', function(socket){
							console.log('Web app connected!');
						})
}

module.exports = SocketController;