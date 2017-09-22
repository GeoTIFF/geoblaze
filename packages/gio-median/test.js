'use strict';

let expect = require('chai').expect;
let load = require('./../gio-load/load');
let median = require('./median');

let url = 'http://localhost:3000/data/test.tiff';
let bbox = [80.63, 7.42, 84.21, 10.10];
let expected_value = 906.70;

let test = () => {
    describe('Gio Median Feature', function() {
        describe('Get Median from Bounding Box', function() {
            this.timeout(1000000);
            it('Got Correct Value', () => {
                return load(url).then(tiff => {
                    let image = tiff.getImage();
                    let value = Number(median(image, bbox).toFixed(2));
                    expect(value).to.equal(expected_value);
                });
            });
        });
    })
}

test();

module.exports = test;