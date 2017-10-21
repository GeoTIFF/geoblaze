'use strict';

let expect = require('chai').expect;
let _ = require('underscore');
let load = require('./../gio-load/load');
let histogram = require('./histogram');

let ratio_quantile_options = {
    scale_type: 'ratio',
    num_classes: 7,
    class_type: 'quantile'
}

let ratio_ei_options = {
    scale_type: 'ratio',
    num_classes: 7,
    class_type: 'equal-interval'
}

let ratio_quantile_bbox_results = {
    "0 - 95.8": 32,
    ">95.8 - 313.1": 32,
    ">313.1 - 743.5": 32,
    ">743.5 - 1255.5": 32,
    ">1255.5 - 1856.1": 32,
    ">1856.1 - 3058.6": 32
}

let ratio_quantile_polygon_results = {
    "0 - 141.8": 235,
    ">141.8 - 686.6": 235,
    ">686.6 - 1214.3": 235,
    ">1214.3 - 1951.8": 235,
    ">1951.8 - 2563.1": 235,
    ">2531.1 - 3474.5": 235
}

let ratio_ei_polygon_results = {
    "0 - 1115.3428571428572": 674,
    ">1115.3428571428572 - 2230.6857142857143": 362,
    ">2230.6857142857143 - 3346.0285714285715": 344,
    ">3346.0285714285715 - 4461.371428571429": 154,
    ">4461.371428571429 - 5576.714285714286": 69,
    ">5576.714285714286 - 6692.057142857143": 22,
    ">6692.057142857143 - 7807.4": 9
}

let url = 'http://localhost:3000/data/test.tiff';

let bbox = [80.63, 7.42, 84.21, 10.10];

let polygon = [[
    [83.12255859375, 22.49225722008518], [82.96875, 21.57571893245848], [81.58447265624999,  1.207458730482642],
    [83.07861328125, 20.34462694382967], [83.8037109375,  19.497664168139053], [84.814453125, 19.766703551716976],
    [85.078125, 21.166483858206583], [86.044921875, 20.838277806058933], [86.98974609375, 22.49225722008518],
    [85.58349609375, 24.54712317973075], [84.6826171875, 23.36242859340884], [83.12255859375, 22.49225722008518]
]];

let polygon_geojson = `{ 
    "type": "FeatureCollection",
    "features": [
        { "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [83.12255859375, 22.49225722008518], [82.96875, 21.57571893245848], [81.58447265624999,  1.207458730482642],
                    [83.07861328125, 20.34462694382967], [83.8037109375,  19.497664168139053], [84.814453125, 19.766703551716976],
                    [85.078125, 21.166483858206583], [86.044921875, 20.838277806058933], [86.98974609375, 22.49225722008518],
                    [85.58349609375, 24.54712317973075], [84.6826171875, 23.36242859340884], [83.12255859375, 22.49225722008518]
                ]]
            },
            "properties": {
                "prop0": "value0",
                "prop1": {"this": "that"}
            }
         }
    ]
}`

let test = () => {
    describe('Gio Histogram Feature', function() {
        describe('Get Histogram (Ratio, Quantile) from Bounding Box', function() {
            this.timeout(1000000);
            it('Got Correct Value', () => {
                return load(url).then(tiff => {
                    let image = tiff.getImage();
                    let results = histogram(image, bbox, ratio_quantile_options)[0];
                    _.keys(ratio_quantile_bbox_results).forEach(key => {
                        let value = results[key];
                        let expected_value = ratio_quantile_bbox_results[key];
                        expect(value).to.equal(expected_value);
                    });
                });
            });
        });
        describe('Get Histogram (Ratio, Quantile) from Polygon', function() {
            this.timeout(1000000);
            it('Got Correct Value', () => {
                return load(url).then(tiff => {
                    let image = tiff.getImage();
                    let results = histogram(image, polygon, ratio_quantile_options)[0];
                    _.keys(ratio_quantile_bbox_results).forEach(key => {
                        let value = results[key];
                        let expected_value = ratio_quantile_polygon_results[key];
                        expect(value).to.equal(expected_value);
                    });
                })
            })
        });
        describe('Get Histogram (Ratio, Equal Interval) from Polygon (GeoJSON)', function() {
            this.timeout(1000000);
            it('Got Correct Value', () => {
                return load(url).then(tiff => {
                    let image = tiff.getImage();
                    let results = histogram(image, polygon_geojson, ratio_ei_options)[0];
                   _.keys(ratio_quantile_bbox_results).forEach(key => {
                        let value = results[key];
                        let expected_value = ratio_ei_polygon_results[key];
                        expect(value).to.equal(expected_value);
                    });
                })
            })
        })
    })
}

test();

module.exports = test;