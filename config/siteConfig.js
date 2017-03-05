// data settings in target site
var siteConfig = {
    'make': {
        'mazda': 59
    },
    'model': {
        'mazda': {
            'mazda 3': 46,
            'mazda 3 sport': 49,
            'mazda 5': 48,
            'mazda 6': 38,
            'mazda speed 3': 50,
            'mazda speed 6': 51,
            'cx-3': 8,
            'cx-5': 36,
            'cx-7': 12,
            'cx-9': 15
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