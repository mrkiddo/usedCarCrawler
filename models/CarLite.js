var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var carLiteSchema = new Schema({
    text: {
        type: String,
        default: 'N/A'
    },
    link: {
        type: String,
        default: 'N/A',
    },
    makeId: {
        type: String,
        default: 'N/A'
    },
    modelId: {
        type: String,
        default: 'N/A'
    }
});

carLiteSchema.statics.removeAll = function () {
    return this.remove({}).exec();
};

module.exports = mongoose.model('CarLite', carLiteSchema);