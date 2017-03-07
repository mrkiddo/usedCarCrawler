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

// TODO: build entries for every car model as an array
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
    modelList.push(carInfo);
});


// TODO: add `node-schedule` or something similar to trigger
crawler.run(modelList);