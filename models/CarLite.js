var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('CarLite', new Schema({
    text: {
        type: String,
        default: '_default car text'
    },
    link: {
        type: String,
        default: '_none'
    },
    make: {
        type: String,
        default: '_none'
    },
    model: {
        type: String,
        default: '_none'
    }
}));