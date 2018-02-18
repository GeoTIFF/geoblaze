'use strict';

let expect = require('chai').expect;
let load = require('./../load/load');
let mean = require('./mean');

let url = 'http://localhost:3000/data/test.tiff';

let bbox = [80.63, 7.42, 84.21, 10.10];
let expected_bbox_value = 1232.47;

let polygon = [[
  [83.12255859375, 22.49225722008518], [82.96875, 21.57571893245848], [81.58447265624999,  1.207458730482642],
  [83.07861328125, 20.34462694382967], [83.8037109375,  19.497664168139053], [84.814453125, 19.766703551716976],
  [85.078125, 21.166483858206583], [86.044921875, 20.838277806058933], [86.98974609375, 22.49225722008518],
  [85.58349609375, 24.54712317973075], [84.6826171875, 23.36242859340884], [83.12255859375, 22.49225722008518]
]];
let expected_polygon_value = 1826.74;

let polygon_geojson = `{
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [83.12255859375, 22.49225722008518], [82.96875, 21.57571893245848], [81.58447265624999,  1.207458730482642],
          [83.07861328125, 20.34462694382967], [83.8037109375,  19.497664168139053], [84.814453125, 19.766703551716976],
          [85.078125, 21.166483858206583], [86.044921875, 20.838277806058933], [86.98974609375, 22.49225722008518],
          [85.58349609375, 24.54712317973075], [84.6826171875, 23.36242859340884], [83.12255859375, 22.49225722008518]
        ]]
      },
      "properties": {
        "prop0": "value0",
        "prop1": {"this": "that"}
      }
     }
  ]
}`
let expected_polygon_geojson_value = 1826.74 ;

let test = () => {
  describe('Gio Mean Feature', function() {
    describe('Get Mean from Bounding Box', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let value = Number(mean(georaster, bbox)[0].toFixed(2));
          expect(value).to.equal(expected_bbox_value);
        });
      });
    });
    describe('Get Mean from Polygon', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let value = Number(mean(georaster, polygon)[0].toFixed(2));
          expect(value).to.equal(expected_polygon_value);
        })
      })
    });
    describe('Get Mean from Polygon (GeoJSON)', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let value = Number(mean(georaster, polygon_geojson)[0].toFixed(2));
          expect(value).to.equal(expected_polygon_geojson_value);
        })
      })
    })
  })
}

test();

module.exports = test;
