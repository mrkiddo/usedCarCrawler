// data settings in target site
var siteConfig = {
    'make': {
        'mazda': 59
    },
    'model': {
        'mazda': {
            'mazda 3': 46,
            'cx-5': 36
        }
    },
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