var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var carSchema = new Schema({
    link: {
        type: String,
        unique: true,
        default: 'N/A'
    },
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
    makeId: {
        type: Number,
        default: 0
    },
    makeName: {
        type: String,
        default: 'N/A'
    },
    modelId: {
        type: Number,
        default: 0
    },
    carModelName: {
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
});

carSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new Error('There was a duplicate key error'));
    }
    else {
        next(error);
    }
});

carSchema.statics.findByLink = function (linkValue, checkExist) {
    var query = this.find({
        link: new RegExp(linkValue, 'i')
    });
    if(checkExist) {
        query.select('link');
    }
    return query.exec();
};

module.exports = mongoose.model('Car', carSchema);