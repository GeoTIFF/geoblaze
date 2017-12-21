'use strict';

let expect = require('chai').expect;
let load = require('./../load/load');

let convert_geometry = require('../convert-geometry/convert-geometry');
let intersect_polygon = require('./intersect-polygon');

let url_rwanda = 'http://localhost:3000/data/RWA_MNH_ANC.tif';
let bbox_rwanda = require("../../data/RwandaBufferedBoundingBox.json");

let url_to_geojson = 'http://localhost:3000/data/gadm/geojsons/Akrotiri and Dhekelia.geojson';

let in_browser = typeof window === 'object';
let fetch = in_browser ? window.fetch : require('node-fetch');

let url = 'http://localhost:3000/data/test.tiff';
let bbox = [80.63, 7.42, 84.21, 10.10];
let expected_bbox_value = 262516.50;

let test = () => {
    describe('Intersect Polygon (getting pixels in raster that intersect polygon)', function() {
        describe("Test intersection calculations for Country with Multiple Rings", function() {
            this.timeout(1000000);
            it("Got correct sum", () => {
                return load(url).then(georaster => {
                    return fetch(url_to_geojson)
                    .then(response => response.json())
                    .then(country => {
                        console.log("country:", country);
                        let number_of_intersecting_pixels = 0;
                        let geom = convert_geometry('polygon', country);
                        intersect_polygon(georaster, geom, () => number_of_intersecting_pixels++);
                        expect(number_of_intersecting_pixels).to.be.above(0);
                    });
                });
            });
        });
    })
}

test();

module.exports = test;
