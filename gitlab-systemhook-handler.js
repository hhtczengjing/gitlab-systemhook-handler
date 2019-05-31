const EventEmitter = require('events').EventEmitter
    , bl = require('bl')
    , bufferEq = require('buffer-equal-constant-time');

function create(options) {
    if (typeof options != 'object') {
        throw new TypeError('must provide an options object')
    }

    if (typeof options.path != 'string') {
        throw new TypeError('must provide a \'path\' option')
    }

    if (typeof options.secret != 'string') {
        throw new TypeError('must provide a \'secret\' option')
    }
    var secret = options.secret;

    handler.__proto__ = EventEmitter.prototype;
    EventEmitter.call(handler);
    handler.verify = verify;
    return handler;

    function verify(signature, secret) {
        return bufferEq(Buffer.from(signature), Buffer.from(secret))
    }

    function handler(req, res, callback) {
        if (req.url.split('?').shift() !== options.path || req.method !== 'POST') {
            return hasError('request invalid');
        }

        function hasError(msg) {
            res.writeHead(404, {'content-type': 'application/json'});
            res.end(JSON.stringify({error: msg}));
            var err = new Error(msg);
            handler.emit('error', err, req);
            callback(err);
        }

        var gitlab_event = req.headers['x-gitlab-event'];
        if (!gitlab_event) {
            return hasError('No X-Gitlab-Event found on request');
        }

        var gitlab_token = req.headers['x-gitlab-token']
        if (!gitlab_token) {
            return hasError('No X-Gitlab-Token found on request');
        }

        req.pipe(bl(function (err, data) {
            if (err) {
                return hasError(err.message);
            }

            if (!verify(secret, gitlab_token)) {
                return hasError('signature verfiy failed');
            }

            var obj;
            try {
                obj = JSON.parse(data.toString());
            } catch (e) {
                return hasError(e);
            }

            res.writeHead(200, {'content-type': 'application/json'});
            res.end('{"ok":true}');

            var event = obj.event_name;
            var emitData = {
                event: event
                , payload: obj
                , protocol: req.protocol
                , host: req.headers['host']
                , url: req.url
            }
            handler.emit(event, emitData);
            handler.emit('*', emitData);
        }));
    }
}

module.exports = create;