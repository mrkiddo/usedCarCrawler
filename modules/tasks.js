var async = require('async');
var mongoose = require('mongoose');
var $ = require('cheerio');

var config = require('../config/config');
var siteConfig = require('../config/siteConfig');
var util = require('../modules/util');
var dataService = require('./dataService');

var tasks = {};
var carBasicInfo = {};

tasks.config = {};

tasks.config.init = function (config) {
    carBasicInfo = config.carBasicInfo;
};

tasks.getFirstPageList = function (callback) {
    console.log('Task: getFirstPageList started');
    var taskTime = util.executeTime();
    var totalPageNumber = 0;
    dataService.getPageBody({
        url: config.siteDataUrl,
        method: 'POST',
        form: {
            make: carBasicInfo.make,
            model: carBasicInfo.model
        }
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

tasks.getOtherPageList = function (prevArg, callback) {
    console.log('Task: getOtherPageList started');
    var taskTime = util.executeTime();
    // prevArg is passed from last task
    var totalPageNumber = prevArg.totalPageNumber;
    var list = [];
    for(var i = 2; i <= totalPageNumber; i++) {
        list.push(i);
    }
    var processor = function (item, cb) {
        dataService.getPageBody({
            url: config.siteDataUrl,
            method: 'POST',
            form: {
                make: carBasicInfo.make,
                model: carBasicInfo.model,
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

tasks.getCarsDetail = function (prevArg, callback) {
    var carsList = prevArg || [];
    console.log('Task: getCarsDetail started');
    var taskTime = util.executeTime();
    var processor = function (item, cb) {
        var url = config.siteBaseUrl + item.link;
        dataService.getPageBody({
            url: url,
            method: 'GET'
        }).then(function (body) {
            return dataService.extractAndSaveEntryInfo(body);
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

module.exports = tasks;