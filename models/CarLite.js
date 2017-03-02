var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('CarLite', new Schema({
    text: {
        type: String,
        default: 'N/A'
    },
    link: {
        type: String,
        default: 'N/A'
    },
    make: {
        type: String,
        default: 'N/A'
    },
    model: {
        type: String,
        default: 'N/A'
    }
}));