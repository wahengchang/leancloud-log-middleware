var request = require('request');
var AV = require('leanengine');
var BASE_URL = (process.env.isUS === 'true') ? 'http://us-api.leancloud.cn/1.1/classes' : 'http://api.leancloud.cn/1.1/classes';
var CLASS = process.env.LOG_SYSTEM_CLASS;

AV.init({
  appId: process.env.LEANCLOUD_APP_ID,
  appKey: process.env.LEANCLOUD_APP_KEY,
  masterKey: process.env.LEANCLOUD_APP_MASTER_KEY,
  region: 'us'
});


var defaultResponsePayload = function(_result, req, res, next){
  return {
      protocol: req.protocol || '',
      host: req.get('host') || '',
      originalUrl: req.originalUrl || '',
      body: req.body ? JSON.stringify(req.body) : '',
      header: req.headers ? JSON.stringify(req.headers) : '',
      version: req.headers ? req.headers.version : '',
      platform: req.headers ? req.headers.platform : '',
      platformVersion: req.headers ? req.headers.platformVersion : '',
      brand: req.headers ? req.headers.brand : '',
      device: req.headers ? req.headers.device : '',
      xRealIp: req.headers ? req.headers['x-real-ip'] : '',
      xForwardedFor: req.headers ? req.headers['x-forwarded-for'] : '',
      userId: AV.User.current() ? AV.User.current().id : '',
      username: AV.User.current() ? AV.User.current().get('username') : '',
      response: JSON.stringify(_result) || '',
      reqOrRes: 'Response'
  }
}


var defaultRequestPayload = function(_result, req, res, next){
  return {
      protocol: req.protocol || '',
      host: req.get('host') || '',
      originalUrl: req.originalUrl || '',
      body: req.body ? JSON.stringify(req.body) : '',
      cookies: req.cookies ? JSON.stringify(req.cookies) : '',
      header: req.headers ? JSON.stringify(req.headers) : '',
      version: req.headers ? req.headers.version : '',
      platform: req.headers ? req.headers.platform : '',
      platformVersion: req.headers ? req.headers.platformVersion : '',
      brand: req.headers ? req.headers.brand : '',
      xRealIp: req.headers ? req.headers['x-real-ip'] : '',
      xForwardedFor: req.headers ? req.headers['x-forwarded-for'] : '',
      userId: AV.User.current() ? AV.User.current().id : '',
      username: AV.User.current() ? AV.User.current().get('username') : '',
      reqOrRes: 'Request',
  }
}

var responseCB = function (err, res, body, cb) {
  if (err) {
    if (cb) cb(err, null);
    console.error(err);
  } else if (!res) {
    if (cb) cb(null, 'Response error without res at log middleware.');
  } else {
    if (res.statusCode === 200 || res.statusCode === 201) {
      if (cb) cb(null, body);
    } else {
      if (cb) cb('Log middleware catch error statusCode is not 200 or 201.' + res.statusCode, null);
      console.error('Log middleware catch error statusCode is not 200 or 201.' + res.statusCode);
    }
  }
};

var add = function (_payload, cb) {
  var url = BASE_URL + '/' + CLASS;

  var headers = {
    'X-LC-Id': process.env.LOG_SYSTEM_APP_ID,
    'X-LC-Key': process.env.LOG_SYSTEM_APP_KEY,
    'Content-Type': 'application/json'
  };

  var options = {
    uri: url,
    method: 'POST',
    headers: headers,
    json: _payload
  };

  request(options, function (err, res, body) {
    responseCB(err, res, body, cb)
  });
}

var remove = function (_objectId, cb) {
  var url = BASE_URL + '/' + CLASS + '/' + _objectId;

  var headers = {
    'X-LC-Id': process.env.LOG_SYSTEM_APP_ID,
    'X-LC-Key': process.env.LOG_SYSTEM_APP_KEY,
    'Content-Type': 'application/json'
  };

  var options = {
    uri: url,
    method: 'DELETE',
    headers: headers
  };

  request(options, function (err, res, body) {
    responseCB(err, res, body, cb)
  });
}

var Request = function (req, res, next) {
  var token = req.cookies.sessiontoken || req.headers.sessiontoken;
  var payload = defaultRequestPayload(req, res, next);
  if (token) {
    AV.User.become(token).then(function (user) {
        payload.userId_new = user ? user.id : '';
        payload.username_new = user ? user.get('username') : '';
      add(payload);
      next();
    });
  } else {
    add(payload);
    next();
  }

};

var Response = function(req, res, next) {
    var ORIGIN_JSON_FUNCTION = res.json;
    var token = req.cookies.sessiontoken || req.headers.sessiontoken;

    res.json = function(_result) {
        var payload = defaultResponsePayload(_result, req, res, next);
        var that = this;
        if (token) {
            AV.User.become(token).then(function(user) {
                payload.userId_new = user ? user.id : '';
                payload.username_new = user ? user.get('username') : '';
                add(payload);
                ORIGIN_JSON_FUNCTION.call(that, _result);
            });
        } else {
            add(payload);
            ORIGIN_JSON_FUNCTION.call(that, _result);
        }
    };
    next();

};


// adding log to logSystem through RESTful API
module.exports = {
    add : add,
    remove : remove,
    Request : Request,
    Response : Response
};



