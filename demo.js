var http = require('http');
var createHandler = require('./gitlab-systemhook-handler.js');
var handler = createHandler({path: '/webhook', secret: '123456'});

http.createServer(function (req, res) {
    handler(req, res, function (err) {
        res.statusCode = 404;
        res.end('no such location');
    });
}).listen(7777);

console.log("Gitlab Hook Server running at http://0.0.0.0:7777/webhook");

handler.on('error', function (err) {
    console.error('Error:', err.message);
});

handler.on('push', function (event) {
    console.log('Received a push event for %s : %s to %s',
        event.payload.user_name,
        event.payload.repository.name,
        event.payload.ref);
});

handler.on('*', function (event) {
    console.log(event.payload);
});