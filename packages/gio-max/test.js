'use strict';

let expect = require('chai').expect;
let load = require('./../gio-load/index');
let max = require('./index');

let url = 'http://localhost:3000/data/test.tiff';
let bbox = [80.63, 7.42, 84.21, 10.10];
let expected_value = 5166.70;

let test = () => {
    describe('Gio Max Feature', function() {
        describe('Get Max from Bounding Box', function() {
            this.timeout(1000000);
            it('Got Correct Value', () => {
                return load(url).then(tiff => {
                    let image = tiff.getImage();
                    let value = Number(max(image, bbox).toFixed(2));
                    expect(value).to.equal(expected_value);
                });
            });
        });
    })
}

test();

module.exports = test;