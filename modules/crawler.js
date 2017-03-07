var async = require('async');

var tasks = require('./tasks');

var processor = function (item, callback) {
    var carInfo = item;
    var taskItem = tasks();
    taskItem.run(callback, {carBasicInfo: carInfo});
};

var crawler = {};

crawler.run = function (modelList) {
    async.eachLimit(modelList, 1, processor, function (error) {
        if(error) {
            console.log(error);
        }
        console.log('All models are finished');
    });
};

module.exports = crawler;