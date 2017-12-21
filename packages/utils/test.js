'use strict';

let expect = require('chai').expect;
let load = require('./../load/load');
let utils = require('./utils');

let url = 'http://localhost:3000/data/RWA_MNH_ANC.tif';
let url_to_geojson = 'http://localhost:3000/data/gadm/geojsons/Akrotiri and Dhekelia.geojson';

let in_browser = typeof window === 'object';
let fetch = in_browser ? window.fetch : require('node-fetch');

let test = () => {
    describe('Get Bounding Box', function() {
        describe('Get Bounding when Bounding Box when Bigger Than Raster', function() {
            this.timeout(1000000);
            it('Got Correct Bounding Box with Negative Values', () => {
                return load(url).then(georaster => {
                    let bbox_with_buffer = {
                        xmin: georaster.xmin - 1,
                        xmax: georaster.xmax + 1,
                        ymin: georaster.ymin - 1,
                        ymax: georaster.ymax + 1
                    };
                    let actual_bbox = utils.convert_crs_bbox_to_image_bbox(georaster, bbox_with_buffer);
                    expect(actual_bbox.xmin).to.be.below(0);
                    expect(actual_bbox.xmin).to.be.below(actual_bbox.xmax);
                    expect(actual_bbox.ymin).to.be.below(0);
                    expect(actual_bbox.ymin).to.be.below(actual_bbox.ymax);
                });
            });
        });
        describe("Get Bounding Box of GeoJSON that has MultiPolygon Geometry (i.e., multiple rings)", function() {
            this.timeout(1000000);
            it("Got correct bounding box", () => {
                return fetch(url_to_geojson)
                .then(response => response.json())
                .then(country => {
                    let bbox = utils.get_bounding_box(country.geometry.coordinates);
                    expect(typeof bbox.xmin).to.equal("number");
                    expect(typeof bbox.xmax).to.equal("number");
                    expect(typeof bbox.ymin).to.equal("number");
                    expect(typeof bbox.ymax).to.equal("number");
                    expect(bbox.xmin).to.equal(32.76010131835966);
                    expect(bbox.xmax).to.equal(33.92147445678711);
                    expect(bbox.ymin).to.equal(34.56208419799816);
                    expect(bbox.ymax).to.equal(35.118995666503906);
                });
            });
        });
    });
    describe("Test Bifurcation", function() {
        describe("For Array of Sample Objects", function() {
            it("Got Correct Split", () => {
                let objs = [{"name": "Canada"}, {"name": "United States"}, {"name": "South Sudan"}, {"name": "Croatia"}];
                let [countries_that_start_with_c, others] = utils.bifurcate(objs, obj => obj.name.startsWith("C"));
                let actual = JSON.stringify(countries_that_start_with_c);
                expect(actual).to.equal('[{"name":"Canada"},{"name":"Croatia"}]');
            });
        });
    });
}

test();

module.exports = test;
