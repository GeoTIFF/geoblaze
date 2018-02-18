'use strict';

let expect = require('chai').expect;
let _ = require('underscore');
let load = require('./../load/load');
let histogram = require('./histogram');

let ratio_quantile_options = {
  scale_type: 'ratio',
  num_classes: 7,
  class_type: 'quantile'
}

let ratio_ei_options = {
  scale_type: 'ratio',
  num_classes: 7,
  class_type: 'equal-interval'
}

let ratio_quantile_bbox_results = {
  '0 - 93.2': 31,
  '>93.2 - 272': 31,
  '>272 - 724': 31,
  '>724 - 1141.9': 31,
  '>1141.9 - 1700.6': 31,
  '>1700.6 - 2732.4': 31,
  '>2732.4 - 5166.7': 28 }

let ratio_quantile_polygon_results = {
  '0 - 129.3': 248,
  '>129.3 - 683.8': 248,
  '>683.8 - 1191': 248,
  '>1191 - 1948.7': 248,
  '>1948.7 - 2567.7': 248,
  '>2567.7 - 3483.9': 248,
  '>3483.9 - 7807.4': 246
};

let ratio_ei_polygon_results = {
  '0 - 1115.34': 719,
  '>1115.34 - 2230.69': 373,
  '>2230.69 - 3346.03': 359,
  '>3346.03 - 4461.37': 170,
  '>4461.37 - 5576.71': 78,
  '>5576.71 - 6692.06': 25,
  '>6692.06 - 7807.4': 9
}

let url = 'http://localhost:3000/data/test.tiff';

let bbox = [80.63, 7.42, 84.21, 10.10];

let polygon = [[
  [83.12255859375, 22.49225722008518], [82.96875, 21.57571893245848], [81.58447265624999,  1.207458730482642],
  [83.07861328125, 20.34462694382967], [83.8037109375,  19.497664168139053], [84.814453125, 19.766703551716976],
  [85.078125, 21.166483858206583], [86.044921875, 20.838277806058933], [86.98974609375, 22.49225722008518],
  [85.58349609375, 24.54712317973075], [84.6826171875, 23.36242859340884], [83.12255859375, 22.49225722008518]
]];

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

let test = () => {
  describe('Gio Histogram Feature', function() {
    describe('Get Histogram (Ratio, Quantile) from Bounding Box', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let results = histogram(georaster, bbox, ratio_quantile_options)[0];
          _.keys(ratio_quantile_bbox_results).forEach(key => {
            let value = results[key];
            let expected_value = ratio_quantile_bbox_results[key];
            expect(value).to.equal(expected_value);
          });
        });
      });
    });
    describe('Get Histogram (Ratio, Quantile) from Polygon', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let results = histogram(georaster, polygon, ratio_quantile_options)[0];
          _.keys(ratio_quantile_polygon_results).forEach(key => {
            let value = results[key];
            let expected_value = ratio_quantile_polygon_results[key];
            expect(value).to.equal(expected_value);
          });
        })
      })
    });
    describe('Get Histogram (Ratio, Equal Interval) from Polygon (GeoJSON)', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          let results = histogram(georaster, polygon_geojson, ratio_ei_options)[0];
          _.keys(ratio_quantile_bbox_results).forEach(key => {
            let value = results[key];
            let expected_value = ratio_ei_polygon_results[key];
            expect(value).to.equal(expected_value);
          });
        })
      })
    })
  })
}

test();

module.exports = test;
