'use strict';

const expect = require('chai').expect;

const fetch = require('node-fetch');

const load = require('./load');

const path = 'http://localhost:3000/data/test.tiff';
const incorrectPath = 'http://localhost:3000/data/this-is-not-a-real-dataset.tiff';
const incorrectPath2 = 'this-is-a-fake-path';
const incorrectPath3 = 'http://localhost:3000/data/random-file';

const errorBadURL = require('../../constants').ERROR_BAD_URL;
const errorParsingGeotiff = require('../../constants').ERROR_PARSING_GEOTIFF;

const properties = [
  'projection',
  'xmin',
  'values'
];

const test = () => (
  describe('Geoblaze Load Feature', function() {

    describe('Load GeoNode Export', function() {
      this.timeout(1000000);
      it('Loaded tiff from geonode', () => {
        let url = "https://s3.amazonaws.com/georaster/geonode_atlanteil.tif";
        return load(url).then(georaster => {
          properties.forEach(property => {
            expect(georaster).to.have.property(property);
          });
        });
      });
    });

    describe('Load from URL', function() {
      this.timeout(1000000);
      it('Loaded tiff file', () => {
        return load(path).then(georaster => {
          properties.forEach(property => {
            expect(georaster).to.have.property(property);
          });
        });
      });
    });

    describe('Error from invalid URL', function() {
      this.timeout(1000000);
      it('Loaded tiff file', () => {
        return load(incorrectPath).then(null, error => {
          expect(error.message).to.equal(errorBadURL);
        });
      });
    });

    describe('Error from another invalid URL', function() {
      this.timeout(1000000);
      it('Loaded tiff file', () => {
        return load(incorrectPath2).then(null, error => {
          expect(error.message).to.equal(errorBadURL);
        });
      });
    });

    describe('Error from an invalid file', function() {
      this.timeout(1000000);
      it('Loaded tiff file', () => {
        return load(incorrectPath3).then(null, error => {
          expect(error.message).to.equal(errorParsingGeotiff);
        });
      });
    });

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
  })
)

test();

module.exports = test;
