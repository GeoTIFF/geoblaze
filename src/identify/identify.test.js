import { expect } from 'chai';
import load from '../load';
import identify from './identify.module';

const url = 'http://localhost:3000/data/test.tiff';
const point = [80.63, 7.42];
const expectedValue = 350.7;

describe('Geoblaze Identify Feature', () => {
  describe('Identify Point in Raster', function () {
    this.timeout(1000000);
    it('Identified Point Correctly', () => {
      return load(url).then(georaster => {
        const value = identify(georaster, point)[0];
        expect(value).to.equal(expectedValue);
      });
    });
  });
  describe('Try to identify point outside raster', function () {
    this.timeout(1000000);
    it('Correctly returned null', () => {
      return load(url).then(georaster => {
        const value = identify(georaster, [-200, 7.42]);
        expect(value).to.equal(null);
      });
    });
  });
});
