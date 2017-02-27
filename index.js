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
    make: siteConfig.make.mazda,
    model: siteConfig.model['mazda']['mazda 3']
};

tasks.config.init({
    carBasicInfo: carBasicInfo
});

var tasksList = [
    tasks.getFirstPageList,
    tasks.getOtherPageList,
    tasks.getCarsList,
    tasks.getCarsDetail
];

var mainTaskTime = util.executeTime();
console.log('Main task started');

async.waterfall(tasksList, function (error, result) {
    if(error) {
        console.log('Main task error: ', error);
    }
    console.log('Main task result: ', result);
    console.log('Main task finished -- ' + mainTaskTime.end() + ' --');
});