'use strict';

let expect = require('chai').expect;

let fetch = require('node-fetch');

let load = require('./load');

let path = 'http://localhost:3000/data/test.tiff';

let properties = [
    'projection',
    'xmin',
    'values'
];

let test = () => (
    describe('Gio Load Feature', function() {
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

        // describe('Load from File', function() {
        //  this.timeout(1000000);
        //  it('Loaded tiff file', () => {
        //      return fetch(path).then(image => {
        //          return load(blob).then(tiff => {
        //              let image = tiff.getImage();
        //              properties.forEach(property => {
        //                  expect(image).to.have.property(property);
        //              })
        //          });
        //      });
        //  })
        // })
    })
)

test();

module.exports = test;
