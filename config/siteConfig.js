// data settings in target site
var siteConfig = {
    'attributes': [
        'stock #',
        'trim',
        'exterior color',
        'interior color',
        'number of doors',
        'engine',
        'transmission',
        'drive type',
        'upholstery',
        'approximate mileage'
    ],
    'attributesMapping': {
        'stock #': 'stockNo',
        'trim': 'trim',
        'exterior color': 'exterior_color',
        'interior color':  'interior_color',
        'number of doors': 'doors',
        'engine': 'engine',
        'transmission': 'transmission',
        'drive type': 'drive_type',
        'upholstery': 'upholstery',
        'approximate mileage': 'approximate_mileage'
    }
};

module.exports = siteConfig;