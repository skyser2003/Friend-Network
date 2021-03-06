var express = require('express');
var routes = require('./controllers/index');
var http = require('http');
var path = require('path');
var app = express();
var facebookInit = require('./socket/facebook.js');

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/test', routes.test);

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


// Socket.io
var io = require('socket.io').listen(server, {log : false});

io.sockets.on('connection', function (socket) {
	facebookInit.Initialize(socket);
});
