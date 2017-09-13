'use strict';

let expect = require('chai').expect;
let load = require('./../gio-load/index');
let mode = require('./index');

let url = 'http://localhost:3000/data/test.tiff';
let bbox = [80.63, 7.42, 84.21, 10.10];
let expected_value = 0;

let test = () => {
    describe('Gio Mode Feature', function() {
        describe('Get Mode from Bounding Box', function() {
            this.timeout(1000000);
            it('Got Correct Value', () => {
                return load(url).then(tiff => {
                    let image = tiff.getImage();
                    let value = mode(image, bbox);
                    expect(value).to.equal(expected_value);
                });
            });
        });
    })
}

test();

module.exports = test;