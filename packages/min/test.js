'use strict';

let expect = require('chai').expect;
let load = require('./../load/load');
let min = require('./min');

let url = 'http://localhost:3000/data/test.tiff';
let bbox = [80.63, 7.42, 84.21, 10.10];
let expected_bbox_value = 0;

let polygon = [[
    [83.12255859375, 22.49225722008518], [82.96875, 21.57571893245848], [81.58447265624999,  1.207458730482642],
    [83.07861328125, 20.34462694382967], [83.8037109375,  19.497664168139053], [84.814453125, 19.766703551716976],
    [85.078125, 21.166483858206583], [86.044921875, 20.838277806058933], [86.98974609375, 22.49225722008518],
    [85.58349609375, 24.54712317973075], [84.6826171875, 23.36242859340884], [83.12255859375, 22.49225722008518]
]];
let expected_polygon_value = 0;

let test = () => {
    describe('Gio Min Feature', function() {
        describe('Get Min from Bounding Box', function() {
            this.timeout(1000000);
            it('Got Correct Value', () => {
                return load(url).then(georaster => {
                    let value = Number(min(georaster, bbox)[0].toFixed(2));
                    expect(value).to.equal(expected_bbox_value);
                });
            });
        });
        describe('Get Min from Polygon', function() {
            this.timeout(1000000);
            it('Got Correct Value', () => {
                return load(url).then(georaster => {
                    let value = Number(min(georaster, polygon)[0].toFixed(2));
                    expect(value).to.equal(expected_polygon_value);
                });
            });
        });
    })
}

test();

module.exports = test;
