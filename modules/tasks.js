var async = require('async');
var $ = require('cheerio');
var logger = require('../config/logger');

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
    logger.info('Task: getFirstPageList started');
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
        logger.error('Error removeAllCarLiteEntry');
        callback(err, null);
    }).then(function (body) {
        // get total page number for this car model
        totalPageNumber = dataService.extractGeneralInfo(body).totalPageNumber;
        var dataBaseResult = dataService.extractEntryUrl(body, carBasicInfo);
        return dataBaseResult; // database promise
    }, function (err) {
        logger.error('Error extractEntryUrl');
        callback(err, null);
    }).then(function () {
        logger.info('Task: getFirstPageList finished -- ' + taskTime.end() + ' --');
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
    logger.info('Task: getOtherPageList started');
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
            logger.error('Task: getOtherPageList, Error: ' + error.message);
            logger.info('Task: getOtherPageList finished -- ' + taskTime.end() + ' --');
            callback(error, null);
        }
        else {
            logger.info('Task: getOtherPageList finished -- ' + taskTime.end() + ' --');
            callback(null, 'task finished');
        }
    });
};
/**
 * @name getCarsList
 */
tasks.getCarsList = function (prevArg, callback) {
    logger.info('Task: getCarsList started');
    var taskTime = util.executeTime();
    var carList = [];
    dataService.getCarUrlList().then(function (list) {
        logger.info('Task: getCarsList finished -- ' + taskTime.end() + ' --');
        callback(null, list);
    }, function (error) {
        logger.error('Task: getCarsList, Error: ' + error.message);
        logger.info('Task: getCarsList finished -- ' + taskTime.end() + ' --');
        callback(error, null);
    });
};
/**
 * @name getCarsDetail
 */
tasks.getCarsDetail = function (prevArg, callback) {
    logger.info('Task: getCarsDetail started');
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
            logger.error('processor error: ' + er.message);
            cb();
        }).then(function () {
            cb();
        }, function () {
            cb();
        });
    };

    async.eachLimit(carsList, 10, processor, function (error) {
        if(error) {
            logger.error('Task: getCarsDetail, Error: ' + error.message);
            logger.info('Task: getCarsDetail finished -- ' + taskTime.end() + ' --');
            callback(error, null);
        }
        else {
            logger.info('Task: getCarsDetail finished -- ' + taskTime.end() + ' --');
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
 * @param done {Function}
 * @param config {Object}
 * @description start to run tasks, `done` for async callback
 */
tasks.run = function (done, config) {
    var self = this;
    self.config.init(config); // assign car basic information

    var modelName = self.config.carBasicInfo.modelName;
    var makeName = self.config.carBasicInfo.makeName;

    var tasksList = self.getTaskList(); // get task list

    var mainTaskTime = util.executeTime();
    logger.info('Main task started');
    logger.info('Task for: ' + makeName + ' - ' + modelName);

    async.waterfall(tasksList, function (error, result) {
        if(error) {
            logger.error('Main task error: ' + error.message);
        }
        logger.info('Main task finished -- ' + mainTaskTime.end() + ' --');
        done();
    });
};

module.exports = function () {
    return Object.assign({}, tasks);
}; // create a new instance