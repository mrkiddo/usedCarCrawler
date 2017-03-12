var async = require('async');
var logger = require('../config/logger');

var util = require('./util');
var tasks = require('./tasks');
var modelList = require('../config/models');

/**
 * @name processor
 * @param {Object} item 
 * @param {Function} callback 
 */
var processor = function (item, callback) {
    var carInfo = item;
    var taskItem = tasks();
    taskItem.run(callback, {carBasicInfo: carInfo});
};

var crawler = {};

/**
 * @description start the whole crawler program
 */
crawler.run = function () {
    var taskTime = util.executeTime();
    logger.info('Crawler: Program started');
    async.eachLimit(modelList, 1, processor, function (error) {
        if(error) {
            logger.error('Crawler error: ' + error.message);
        }
        logger.info('Crawler: All models are finished -- ' + taskTime.end() + ' --');
    });
};

module.exports = crawler;