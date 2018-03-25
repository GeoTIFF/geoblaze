'use strict';

const expect = require('chai').expect;
const load = require('./../load/load');
const band_arithmetic = require('./band-arithmetic');
const sum = require('../sum/sum');

// TODO - find a 3 band raster, this one wont work
const url = 'http://localhost:3000/data/test.tiff';

const geometry = [[
  [83.12255859375, 22.49225722008518], [82.96875, 21.57571893245848], [81.58447265624999,  1.207458730482642],
  [83.07861328125, 20.34462694382967], [83.8037109375,  19.497664168139053], [84.814453125, 19.766703551716976],
  [85.078125, 21.166483858206583], [86.044921875, 20.838277806058933], [86.98974609375, 22.49225722008518],
  [85.58349609375, 24.54712317973075], [84.6826171875, 23.36242859340884], [83.12255859375, 22.49225722008518]
]];

const calculation_1 = 'a + b';
const expected_value_1 = 0;

const calculation_2 = 'b - a * 2';
const expected_value_2 = 0;

const calculation_3 = '2a * c + 10';
const expected_value_3 = 0;

const calculation_4 = '(a - b)/(a + b)';
const expected_value_4 = 0;

let test = () => {
  describe('Geoblaze Band Arithmetic Feature', function() {
    describe('Run Calculation 1', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          const computed_georaster = band_arithmetic(georaster, calculation_1);
          const value = sum(computed_georaster, geometry);
          expect(value).to.equal(expected_value_1);
        });
      });
    });
  });
}

test();

module.exports = test;
