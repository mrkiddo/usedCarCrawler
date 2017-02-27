var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Car', new Schema({
    approximate_mileage: {
        type: Number,
        default: 0
    },
    dealerAddress: {
        type: String,
        default: 'N/A'
    },
    dealerName: {
        type: String,
        default: 'N/A'
    },
    drive_type: {
        type: String,
        default: 'N/A'
    },
    engine: {
        type: String,
        default: 'N/A'
    },
    exterior_color: {
        type: String,
        default: 'N/A'
    },
    interior_color: {
        type: String,
        default: 'N/A'
    },
    doors :{
        type: String,
        default: 'N/A'
    },
    price: {
        type: Number,
        default: 0,
    },
    stockNo: {
        type: String,
        default: 'n/a'
    },
    title: {
        type: String,
        default: 'N/A'
    },
    transmission: {
        type: String,
        default: 'N/A'
    },
    trim: {
        type: String,
        default: 'N/A'
    },
    upholstery: {
        type: String,
        default: 'N/A'
    }
}));