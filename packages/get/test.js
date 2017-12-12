'use strict';

let expect = require('chai').expect;
let load = require('./../load/load');
let get = require('./get');

let url_rwanda = 'http://localhost:3000/data/RWA_MNH_ANC.tif';
let bbox_rwanda = require("../../data/RwandaBufferedBoundingBox.json");

let test = () => {
    describe('Get Values', function() {
        describe('Get Flat Values when Geom bigger than Raster', function() {
            this.timeout(1000000);
            it('Got Correct Flat Values', () => {
                return load(url_rwanda).then(georaster => {
                    let actual_values = get(georaster, bbox_rwanda, true);
                    expect(actual_values).to.have.lengthOf(1);
                    expect(actual_values[0]).to.have.lengthOf(georaster.height * georaster.width);
                });
            });
        });
        describe('Get 2-D Values when Geom bigger than Raster', function() {
            this.timeout(1000000);
            it('Got Correct 2-D Values', () => {
                return load(url_rwanda).then(georaster => {
                    let actual_values = get(georaster, bbox_rwanda, false);
                    expect(actual_values).to.have.lengthOf(1);
                    expect(actual_values[0]).to.have.lengthOf(georaster.height);
                    expect(actual_values[0][0]).to.have.lengthOf(georaster.width);
                });
            });
        });
 
    })
}

test();

module.exports = test;
