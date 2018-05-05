import { expect } from 'chai';
import load from '../load';
import get from './get.module';

const urlRwanda = 'http://localhost:3000/data/RWA_MNH_ANC.tif';
const bboxRwanda = require('../../data/RwandaBufferedBoundingBox.json');

describe('Get Values', () => {
  describe('Get Flat Values when Geom bigger than Raster', function () {
    this.timeout(1000000);
    it('Got Correct Flat Values', () => {
      return load(urlRwanda).then(georaster => {
        const actualValues = get(georaster, bboxRwanda, true);
        expect(actualValues).to.have.lengthOf(1);
        expect(actualValues[0]).to.have.lengthOf(georaster.height * georaster.width);
      });
    });
  });
  describe('Get 2-D Values when Geom bigger than Raster', function () {
    this.timeout(1000000);
    it('Got Correct 2-D Values', () => {
      return load(urlRwanda).then(georaster => {
        const actualValues = get(georaster, bboxRwanda, false);
        expect(actualValues).to.have.lengthOf(1);
        expect(actualValues[0]).to.have.lengthOf(georaster.height);
        expect(actualValues[0][0]).to.have.lengthOf(georaster.width);
      });
    });
  });
  describe('Get flat values for whole raster', function () {
    this.timeout(1000000);
    it('Got Correct flat values', () => {
      return load(urlRwanda).then(georaster => {
        const flat = true;
        const actualValues = get(georaster, null, flat);
        expect(actualValues).to.have.lengthOf(1);
        expect(actualValues[0]).to.have.lengthOf(georaster.height * georaster.width);
      });
    });
  });
});
