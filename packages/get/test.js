'use strict';

let expect = require('chai').expect;
let load = require('./../load/load');
let get = require('./get');

let urlRwanda = 'http://localhost:3000/data/RWA_MNH_ANC.tif';
let bboxRwanda = require("../../data/RwandaBufferedBoundingBox.json");

let test = () => {
  describe('Get Values', function() {
    describe('Get Flat Values when Geom bigger than Raster', function() {
      this.timeout(1000000);
      it('Got Correct Flat Values', () => {
        return load(urlRwanda).then(georaster => {
          let actualValues = get(georaster, bboxRwanda, true);
          expect(actualValues).to.have.lengthOf(1);
          expect(actualValues[0]).to.have.lengthOf(georaster.height * georaster.width);
        });
      });
    });
    describe('Get 2-D Values when Geom bigger than Raster', function() {
      this.timeout(1000000);
      it('Got Correct 2-D Values', () => {
        return load(urlRwanda).then(georaster => {
          let actualValues = get(georaster, bboxRwanda, false);
          expect(actualValues).to.have.lengthOf(1);
          expect(actualValues[0]).to.have.lengthOf(georaster.height);
          expect(actualValues[0][0]).to.have.lengthOf(georaster.width);
        });
      });
    });
    describe('Get flat values for whole raster', function() {
      this.timeout(1000000);
      it('Got Correct flat values', () => {
        return load(urlRwanda).then(georaster => {
          let flat = true;
          let actualValues = get(georaster, null, flat);
          expect(actualValues).to.have.lengthOf(1);
          expect(actualValues[0]).to.have.lengthOf(georaster.height * georaster.width);
        });
      });
    });
  })
}

test();

module.exports = test;
