'use strict';

var SocketController = function(io) {
	var _this = this;


	_this.io = io;

	_this.io.on('connection', newConnection);

	function newConnection(socket){
		socket.emit('server-connected', {message: 'Connected to API Server!'});
	}
}

module.exports = SocketController;