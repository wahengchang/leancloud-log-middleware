
var logModule = require('./index.js'),
  httpMocks = require('node-mocks-http'), // quickly sets up REQUEST and RESPONSE to be passed into Express Middleware
  request = {}, // define REQUEST
  response = {}; // define RESPONSE

describe('log module', function () {
    var _objectId = '';

  this.timeout(10000);
  
  it('add function', (done) => {
    var options = {
      protocol: 'req.protocol',
      host: 'req.get(host)',
      originalUrl: 'req.originalUrl',
      body: 'req.body',
      cookies: 'req.cookies',
      header: 'req.headers'
    };

    logModule.add(options, function(err, result){
      if (err) return done(err);
      TEST_OBJECT_ID = result.objectId;
      done();
    });
  });

  it('remove function', (done) => {
    logModule.remove(TEST_OBJECT_ID,function(err, result){
      if (err) return done(err);
      done();
    });
  });

});


describe('Middleware test', function () {
    var _objectId = '';

    beforeEach(function (done) {
      request = httpMocks.createRequest();
      response = httpMocks.createResponse();

      done(); // call done so that the next test can run
    });


    it('    Request', function (done) {
        logModule.Request(request, response, function next(err) {
          if (err) return done(err);
          done();
        });
    });

    it('    Response', function (done) {
        logModule.Response(request, response, function next(err) {
          if (err) return done(err);
          done();
        });
    });
});