var util = {};

util.htmlTagRegExp = /<[^>]+>/g;
/**
 * @name executeTime
 * @return {Object}
 */
util.executeTime = function () {
    var o = {
        startTime: new Date(),
        endTime: {},
        start: function () {
            this.startTime = new Date()
        },
        end: function (original) {
            var diff;
            this.endTime = new Date();
            if(original) {
                diff = (this.endTime - this.startTime) + 'ms';
            }
            else {
                diff = (this.endTime - this.startTime) / 1000 + 's';
            }
            return diff;
        }
    };
    return Object.assign({}, o);
};

module.exports = util;