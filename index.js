var async = require('async');
var mongoose = require('mongoose');
var Promise = require('promise');

var config = require('./config/config');
var siteConfig = require('./config/siteConfig');
var util = require('./modules/util');
var tasks = require('./modules/tasks');

// replace mongoose build-in promise library
mongoose.Promise = Promise;
// connect to mongodb
mongoose.connect(config.database);

// default car information
var carBasicInfo = {
    makeId: siteConfig.make.mazda,
    modelId: siteConfig.model['mazda']['mazda 3'],
    makeName: 'mazda',
    modelName: 'mazda 3'
};

var currentMake = 'mazda';
var currentMakeId = siteConfig.make[currentMake];
var makeModels = Object.keys(siteConfig.model[currentMake]);
var modelList = []; // create a list of function to run

makeModels.forEach(function (model) {
    var carInfo = Object.assign({}, carBasicInfo, {
        makeId: currentMakeId,
        modelId: siteConfig.model[currentMake][model],
        makeName: currentMake,
        modelName: model
    });
    var fn = (function (carInfo) {
        return function (done) {
            var taskItem = tasks();
            taskItem.run(done, {carBasicInfo: carInfo});
        };
    })(carInfo);
    modelList.push(fn); // one function for each model
});

async.series(modelList, function (err) {
    if(err) {
        console.log(err);
    }
    console.log('All models are finished');
});