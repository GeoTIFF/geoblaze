'use strict';

const expect = require('chai').expect;

const fetch = require('node-fetch');

const load = require('./load');

const path = 'http://localhost:3000/data/test.tiff';
const incorrect_path = 'http://localhost:3000/data/this-is-not-a-real-dataset.tiff';
const incorrect_path_2 = 'this-is-a-fake-path';

const error_bad_url = require('../../constants').ERROR_BAD_URL;

const properties = [
  'projection',
  'xmin',
  'values'
];

const test = () => (
  describe('Geoblaze Load Feature', function() {
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
        return load(incorrect_path).then(null, error => {
          expect(error.message).to.equal(error_bad_url);
        });
      });
    });

    describe('Error from another invalid URL', function() {
      this.timeout(1000000);
      it('Loaded tiff file', () => {
        return load(incorrect_path_2).then(null, error => {
          expect(error.message).to.equal(error_bad_url);
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
