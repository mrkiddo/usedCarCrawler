var async = require('async');
var mongoose = require('mongoose');
var Promise = require('promise');

var config = require('./config/config');
var siteConfig = require('./config/siteConfig');
var crawler = require('./modules/crawler');

// replace mongoose build-in promise library
mongoose.Promise = Promise;
// connect to mongodb
mongoose.connect(config.database);

// TODO: add `node-schedule` or something similar to trigger
crawler.run();