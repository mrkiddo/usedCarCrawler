var async = require('async');
var Promise = require('promise');
var request = require('request');
var $ = require('cheerio');

var siteConfig = require('../config/siteConfig');
var util = require('./util');
var CarLite = require('../models/CarLite');
var Car = require('../models/Car');

var dataService = {};
var o = dataService;

// general use - like methods
/**
 * @name requestData
 * @param cfg {Object}
 * @return Promise {Object}
 */
o.requestData = function (cfg) {
    cfg = cfg || {};
    return new Promise(function (resolve, reject) {
        request(cfg, function (error, response, body) {
            if(error) {
                reject(error);
            }
            else {
                resolve(body);
            }
        });
    });
};
/**
 * @name getPageBody
 * @param cfg {Object}
 * @param processor {Function}
 * @return Promise {Object}
 */
o.getPageBody = function (cfg, processor) {
    var rawData = this.requestData(cfg);
    return new Promise(function (resolve, reject) {
        rawData.then(function (body) {
            if(processor && typeof(processor) === 'function') {
                resolve(processor(body));
            }
            else {
                resolve(body);
            }
        }, function (error) {
            reject(error);
        });
    });
};
/**
 * @name saveToDB
 * @param Model {Object}
 * @param data {Array | Object}
 * @return Promise {Object}
 */
o.saveToDB = function (Model, data) {
    var promise;
    if(data.length === 1) {
        promise = Model.save(data);
    }
    else {
        promise = Model.create(data);
    }
    return promise;
};
/**
 * @name getDataOneFromDB
 * @description return only entry from database
 * @param Model {Object}
 * @param condition {Object}
 * @param columns {String}
 * @return Promise {Object}
 */
o.getDataOneFromDB = function (Model, condition, columns) {
    condition = condition || {};
    var query = Model.findOne(condition);
    if(columns) {
        query.select(columns);
    }
    return query.exec();
};
/**
 * @name getDataFromDB
 * @param Model {Object}
 * @param condition {Object}
 * @param columns {String}
 * @return Promise {Object}
 */
o.getDataFromDB = function (Model, condition, columns) {
    condition = condition || {};
    var query = Model.find(condition);
    if(columns) {
        query.select(columns);
    }
    return query.exec();
};
/**
 * @name updateDataFromDB
 * @param Model {Object}
 * @param condition {Object}
 * @param document {Object}
 * @return Promise {Object}
 */
o.updateDataFromDB = function (Model, condition, document) {
    condition = condition || {};
    var query = Model.update(condition, document);
    return query.exec();
};

// project - oriented methods

o.removeAllCarLiteEntry = function () {
    return CarLite.removeAll();
};

o.extractGeneralInfo = function (body) {
    body = $(body);
    var totalEntryNum = body.find('div.resultsText').text();
    var entryPerPage = body.find('#per_page').val();
    var pageCount = 0;
    totalEntryNum = totalEntryNum.match(/[0-9]+/)[0];
    totalEntryNum = parseInt(totalEntryNum, 10);
    entryPerPage = parseInt(entryPerPage, 10);
    if(totalEntryNum && entryPerPage) {
        pageCount = Math.ceil(totalEntryNum / entryPerPage);
    }
    return {
        totalPageNumber: pageCount
    };
};

o.extractEntryUrl = function (body, carInfo) {
    body = $(body);
    var list = [];
    var elements = body.find('.resultRow .result_header a');
    elements.each(function () {
        list.push({
            link: $(this).attr('href'),
            text: $(this).text(),
            makeId: carInfo.makeId,
            modelId: carInfo.modelId
        });
    });
    var result = this.saveToDB(CarLite, list);
    return result;
};

o.getCarUrlList = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        var dataBaseResult = self.getDataFromDB(CarLite, null, 'link');
        dataBaseResult.then(function (list) {
            resolve(list);
        }, function (error) {
            reject(error);
        });
    });
};

o.checkEntryExist = function (entryLink) {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.getDataOneFromDB(Car, {link: entryLink}, 'link').then(function (doc) {
            var isExist = true;
            if(!doc) {
                isExist = false;
            }
            resolve({
                exist: isExist
            });
        }, function (err) {
            resolve({
                exist: false
            });
        });
    });
};

o.extractAndSaveEntryInfo = function (body, entryLink, carBasicInfo) {
    var modelId = carBasicInfo.modelId;
    var modelName = carBasicInfo.modelName;
    var makeId = carBasicInfo.makeId;
    var makeName = carBasicInfo.makeName;

    var attributes = siteConfig.attributes;
    var mapping = siteConfig.attributesMapping;
    var wrapper = $(body).find('.rLeft');
    var table = wrapper.find('table');
    var titles = table.find('.tTitle');
    var dealerName = $(body).find('.dealer_name');
    var dealerAddress = $(body).find('#dealer_address');

    var htmlTagReg = util.htmlTagRegExp;
    var entry = {};

    entry.link = entryLink;
    entry.makeId = parseInt(makeId, 10);
    entry.makeName = makeName;
    entry.modelId = parseInt(modelId, 10);
    entry.carModelName = modelName;

    entry.title = wrapper.find('h1').text();
    var price = wrapper.find('h2').text();
    price = price.match(/[0-9]+/g);
    if(price && price.length > 0) {
        price = price.join('');
        price = parseInt(price, 10);
    }
    entry.price = price;
    entry.dealerName = dealerName.html().replace(htmlTagReg, '');
    entry.dealerAddress = dealerAddress.html().replace(htmlTagReg, '');

    titles.each(function () {
        var el = $(this);
        var text = $(this).text().replace(':', '').toLowerCase();
        var isMatch = attributes.some(function (elem) {
            return (text === elem);
        });
        if(isMatch) {
            var attributeName = mapping[text];
            var data = $(this).siblings('td').text();
            if(attributeName == 'approximate_mileage') {
                data = data.match(/[0-9]+/g);
                if(data && data.length > 0) {
                    data = data.join('');
                    data = parseInt(data, 10);
                }
                else {
                    data = 0;
                }
            }
            entry[attributeName] = data;
        }
    });

    return this.saveToDB(Car, entry);
};

module.exports = o;