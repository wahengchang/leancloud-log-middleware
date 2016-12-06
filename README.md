# leancloud-log-middleware

Middleware of creating Leancloud object, by configuring LOG_SYSTEM_APP_ID, LOG_SYSTEM_APP_KEY and LOG_SYSTEM_CLASS

[![NPM](https://nodei.co/npm/leancloud-log-middleware.png?downloads=true&downloadRank=true)](https://www.npmjs.com/package/leancloud-log-middleware)


## Install

```
$ npm install --save leancloud-log-middleware
```

## Initializing

```js

// Before runing express server
export LOG_SYSTEM_APP_ID=YOUR_LEANCLOUD_API_IP
export LOG_SYSTEM_APP_KEY=YOUR_LEANCLOUD_API_KEY
export LOG_SYSTEM_CLASS=YOUR_LEANCLOUD_CLASS

$ npm start
```

## Usage
#### upload
```js

var express = require('express');
var app = express();
var logModule = require('leancloud-log-middleware');

// bodyParser needed to include if req.body is needed ...
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.use(logModule.Request);
app.use(logModule.Response)

...

app.use('/', routes);
app.use('/v1/users', users);

```