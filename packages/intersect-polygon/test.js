'use strict';

let expect = require('chai').expect;
let load = require('./../load/load');
let utils = require("./../utils/utils");

let convert_geometry = require('../convert-geometry/convert-geometry');
let intersect_polygon = require('./intersect-polygon');

let url_rwanda = 'http://localhost:3000/data/RWA_MNH_ANC.tif';
let bbox_rwanda = require("../../data/RwandaBufferedBoundingBox.json");

let url_to_geojson = 'http://localhost:3000/data/gadm/geojsons/Akrotiri and Dhekelia.geojson';

let in_browser = typeof window === 'object';
let fetch = in_browser ? window.fetch : require('node-fetch');

let url_to_data = "http://localhost:3000/data/";

let url_to_rice = url_to_data + "spam2005v2r0_physical-area_rice_total.tiff";

let url = url_to_data + 'test.tiff';
let bbox = [80.63, 7.42, 84.21, 10.10];
let expected_bbox_value = 262516.50;

let url_to_example_tiff = url_to_data + "example_4326.tif";

let turf_bbox = require("@turf/bbox");
let turf_bboxPolygon = require("@turf/bbox-polygon");

let test = () => {
    describe("Testing intersection of simple geometries", function() {
        describe("Testing intersection of box", function() {
            it("Got correct count_of_values", function() {
                this.timeout(1000000);
                return load(url).then(georaster => {

                    let expected_number_of_intersecting_pixels = 0;
                    georaster.values.forEach(band => {
                        band.forEach(row => {
                            row.forEach(value => {
                                if (value != georaster.no_data_value) {
                                    expected_number_of_intersecting_pixels++;
                                }
                            });
                        });
                    });
                    console.log("[test] expect_number_of_intersecting_pixels:", expected_number_of_intersecting_pixels);
                    let pixelHeight = georaster.pixelHeight;
                    let pixelWidth = georaster.pixelWidth;
                    // minX, minY, maxX, maxY 
                    let geom = turf_bboxPolygon([georaster.xmin + .5*pixelWidth, georaster.ymin + .5*pixelHeight, georaster.xmax - .5*pixelWidth, georaster.ymax - .5*pixelHeight]);
                    console.log("[test] geom:", geom);
                    let coordinates = utils.get_geojson_coors(geom);
                    console.log("[test] coordinates:", coordinates);
                    let number_of_intersecting_pixels = 0;
                    intersect_polygon(georaster, coordinates, () => number_of_intersecting_pixels++);
                    expect(number_of_intersecting_pixels).to.equal(expected_number_of_intersecting_pixels);
                });
            });
        });
    });
    describe('Intersect Polygon (getting pixels in raster that intersect polygon)', function() {
        describe("Test intersection calculations for Country with Multiple Rings", function() {
            this.timeout(1000000);
            it("Got correct sum", () => {
                return load(url_to_data + "ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_30_40.tif").then(georaster => {
                    return fetch(url_to_geojson)
                    .then(response => response.json())
                    .then(country => {
                        let number_of_intersecting_pixels = 0;
                        let geom = convert_geometry('polygon', country);
                        intersect_polygon(georaster, geom, () => number_of_intersecting_pixels++);
                        expect(number_of_intersecting_pixels).to.equal(281);
                    });
                });
            });
        });
    })
}

test();

module.exports = test;
