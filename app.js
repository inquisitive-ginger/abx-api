// package dependencies
var bodyParser 		= require('body-parser');
var cookieParser 	= require('cookie-parser');
var cors 			= require('cors'); 
var express 		= require('express'); 
var favicon 		= require('serve-favicon'); 
var http 			= require('http');
var path 			= require('path'); 
var proxymw 		= require('http-proxy-middleware');


var app = express();

app.use(cors({origin: true, credentials: true}));


// http server
var server 	= http.createServer(app);

// controllers
var DM32Controller 		= require('./controllers/dm32.controller');
var ResultsController 	= require('./controllers/results.controller');
var SocketController 	= require('./controllers/socket.controller');

var socketCtl 		= new SocketController(server);
global.dm32Manager 	= new DM32Controller(socketCtl);
global.results 		= new ResultsController(socketCtl);

// register api routes
var api = require('./routes/api');
app.use('/api', api);

server.listen(3000);
