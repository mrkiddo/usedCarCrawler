var async = require('async');
var mongoose = require('mongoose');

var config = require('./config/config');
var siteConfig = require('./config/siteConfig');
var util = require('./modules/util');
var tasks = require('./modules/tasks');

// replace mongoose build-in promise library
mongoose.Promise = Promise;
// connect to mongodb
mongoose.connect(config.database);

// car information for this running
var carBasicInfo = {
    makeId: siteConfig.make.mazda,
    modelId: siteConfig.model['mazda']['mazda 3'],
    makeName: 'mazda',
    modelName: 'mazda 3'
};

// kick off the tasks
tasks.run({
    carBasicInfo: carBasicInfo
});