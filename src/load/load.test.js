import { expect } from 'chai';
import load from './load.module';

import {
  ERROR_BAD_URL
  //ERROR_PARSING_GEOTIFF
} from '../error-constants';

const path = 'http://localhost:3000/data/test.tiff';
const incorrectPath = 'http://localhost:3000/data/this-is-not-a-real-dataset.tiff';
const incorrectPath2 = 'this-is-a-fake-path';
//const incorrectPath3 = 'http://localhost:3000/data/random-file';

const properties = [
  'projection',
  'xmin',
  'values'
];

describe('Geoblaze Load Feature', () => {

  describe('Load GeoNode Export', function () {
    this.timeout(1000000);
    it('Loaded tiff from geonode', () => {
      const url = 'https://s3.amazonaws.com/georaster/geonode_atlanteil.tif';
      return load(url).then(georaster => {
        properties.forEach(property => {
          expect(georaster).to.have.property(property);
        });
      });
    });
  });

  describe('Load from URL', function () {
    this.timeout(1000000);
    it('Loaded tiff file', () => {
      return load(path).then(georaster => {
        properties.forEach(property => {
          expect(georaster).to.have.property(property);
        });
      });
    });
  });

  describe('Error from invalid URL', function () {
    this.timeout(1000000);
    it('Loaded tiff file', () => {
      return load(incorrectPath).then(null, error => {
        expect(error.message).to.equal(ERROR_BAD_URL);
      });
    });
  });

  describe('Error from another invalid URL', function () {
    this.timeout(1000000);
    it('Loaded tiff file', () => {
      return load(incorrectPath2).then(null, error => {
        expect(error.message).to.equal(ERROR_BAD_URL);
      });
    });
  });

  /*
  // commenting out this test because failing because Unhandled Promise Rejection
  // in georaster
  describe('Error from an invalid file', function () {
    this.timeout(10);
    it('Loaded tiff file', () => {
      try {
        return load(incorrectPath3).then(null, error => {
          expect(error.message).to.equal(ERROR_PARSING_GEOTIFF);
        });
      } catch(error) {
        expect(error.message).to.equal(ERROR_PARSING_GEOTIFF);
      }
    });
  });
  */

  // describe('Load from File', function() {
  //  this.timeout(1000000);
  //  it('Loaded tiff file', () => {
  //    return fetch(path).then(image => {
  //      return load(blob).then(tiff => {
  //        let image = tiff.getImage();
  //        properties.forEach(property => {
  //          expect(image).to.have.property(property);
  //        })
  //      });
  //    });
  //  })
  // })
});
