var async = require('async');
var $ = require('cheerio');

var config = require('../config/config');
var siteConfig = require('../config/siteConfig');
var util = require('../modules/util');
var dataService = require('./dataService');

// define object
var tasks = {};

tasks.config = {};
tasks.config.carBasicInfo = {};
/**
 * @name config.init
 * @param config {Object}
 */
tasks.config.init = function (config) {
    this.carBasicInfo = config.carBasicInfo;
};
/**
 * @name getFirstPageList
 */
tasks.getFirstPageList = function (callback) {
    console.log('Task: getFirstPageList started');
    var taskTime = util.executeTime();
    var totalPageNumber = 0;
    var carBasicInfo = this.config.carBasicInfo;
    var formData = {
        make: this.config.carBasicInfo.makeId,
        model: this.config.carBasicInfo.modelId,
        makeName: this.config.carBasicInfo.makeName,
        modelName: this.config.carBasicInfo.modelName,
    };
    dataService.removeAllCarLiteEntry().then(function () {
        return dataService.getPageBody({
            url: config.siteDataUrl,
            method: 'POST',
            form: formData
        });
    }, function (error) {
        callback(err, null);
    }).then(function (body) {
        // get total page number for this car model
        totalPageNumber = dataService.extractGeneralInfo(body).totalPageNumber;
        var dataBaseResult = dataService.extractEntryUrl(body, carBasicInfo);
        return dataBaseResult; // database promise
    }, function (err) {
        callback(err, null);
    }).then(function () {
        console.log('Task: getFirstPageList finished -- ' + taskTime.end() + ' --');
        callback(null, {
            totalPageNumber: totalPageNumber
        });
    }, function (err) {
        callback(err, null);
    });
};
/**
 * @name getOtherPageList
 */
tasks.getOtherPageList = function (prevArg, callback) {
    console.log('Task: getOtherPageList started');
    var taskTime = util.executeTime();
    // prevArg is passed from last task
    var totalPageNumber = prevArg.totalPageNumber;
    var carBasicInfo = this.config.carBasicInfo;
    var list = [];
    for(var i = 2; i <= totalPageNumber; i++) {
        list.push(i);
    }
    var processor = function (item, cb) {
        dataService.getPageBody({
            url: config.siteDataUrl,
            method: 'POST',
            form: {
                make: carBasicInfo.makeId,
                model: carBasicInfo.modelId,
                page: item
            }
        }).then(function (body) {
            var dataBaseResult = dataService.extractEntryUrl(body, carBasicInfo);
            return dataBaseResult; // database promise
        }).then(function () {
            cb();
        }, function () {
            cb();
        });
    };
    async.eachLimit(list, 10, processor, function (error) {
        if(error) {
            console.log('Task: getOtherPageList, Error: ', error);
            console.log('Task: getOtherPageList finished -- ' + taskTime.end() + ' --');
            callback(error, null);
        }
        else {
            console.log('Task: getOtherPageList finished -- ' + taskTime.end() + ' --');
            callback(null, 'task finished');
        }
    });
};
/**
 * @name getCarsList
 */
tasks.getCarsList = function (prevArg, callback) {
    console.log('Task: getCarsList started');
    var taskTime = util.executeTime();
    var carList = [];
    dataService.getCarUrlList().then(function (list) {
        console.log('Task: getCarsList finished -- ' + taskTime.end() + ' --');
        callback(null, list);
    }, function (error) {
        console.log('Task: getCarsList finished -- ' + taskTime.end() + ' --');
        callback(error, null);
    });
};
/**
 * @name getCarsDetail
 */
tasks.getCarsDetail = function (prevArg, callback) {
    console.log('Task: getCarsDetail started');
    var carsList = prevArg || [];
    var carBasicInfo = this.config.carBasicInfo;
    var taskTime = util.executeTime();
    var processor = function (item, cb) {
        var url = config.siteBaseUrl + item.link;
        // first, check if entry already exists
        dataService.checkEntryExist(item.link).then(function (result) {
            if(result.exist) {
                cb();
            }
            else {
                return dataService.getPageBody({
                    url: url,
                    method: 'GET'
                });
            }
        }).then(function (body) {
            // database promise
            return dataService.extractAndSaveEntryInfo(body, item.link, carBasicInfo);
        }, function (er) {
            console.log('processor error: ', er);
            cb();
        }).then(function () {
            cb();
        }, function () {
            cb();
        });
    };

    async.eachLimit(carsList, 10, processor, function (error) {
        if(error) {
            console.log('Task: getCarsDetail, Error: ', error);
            console.log('Task: getCarsDetail finished -- ' + taskTime.end() + ' --');
            callback(error, null);
        }
        else {
            console.log('Task: getCarsDetail finished -- ' + taskTime.end() + ' --');
            callback(null, 'task finished');
        }
    });
};
/**
 * @name
 * @description bind current object scope to all tasks
 * @return tasksList {Array}
 */
tasks.getTaskList = function () {
    var self = this;
    var tasksList = [
        this.getFirstPageList,
        this.getOtherPageList,
        this.getCarsList,
        this.getCarsDetail
    ];
    tasksList.forEach(function (element, index, array) {
        array[index] = array[index].bind(self);
    });
    return tasksList;
};
/**
 * @name run
 * @param config {Object}
 * @description start to run tasks
 */
tasks.run = function (config) {
    var self = this;
    self.config.init(config);

    var tasksList = self.getTaskList();

    var mainTaskTime = util.executeTime();
    console.log('Main task started');

    async.waterfall(tasksList, function (error, result) {
        if(error) {
            console.log('Main task error: ', error);
        }
        console.log('Main task result: ', result);
        console.log('Main task finished -- ' + mainTaskTime.end() + ' --');
    });
};

module.exports = Object.assign({}, tasks); // create a new instance