'use strict';

let expect = require('chai').expect;
let load = require('./../load/load');
let utils = require('./utils');

let url = 'http://localhost:3000/data/RWA_MNH_ANC.tif';
let url_to_geojsons = 'http://localhost:3000/data/gadm/geojsons/';
let url_to_geojson = url_to_geojsons + 'Akrotiri and Dhekelia.geojson';

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

                objs = [{keep: true}, {keep: false}, {keep: true}, {keep: false}];
                let [kept, thrown_away] = utils.bifurcate(objs, "keep");
                expect(kept).to.have.lengthOf(2);
                expect(thrown_away).to.have.lengthOf(2);
            });
        });
    });
    describe("Test Get Depth", function() {
        describe("For Multipolygon", function() {
            this.timeout(1000000);
            it("Get Correct Depth", () => {
                let country_depths = [["Afghanistan", 3], ['Akrotiri and Dhekelia', 4], ["Canada", 4]];
                let promises = country_depths.map(country_depth => {
                    let [country, depth] = country_depth;
                    return fetch(url_to_geojsons + country + ".geojson")
                    .then(response => response.json())
                    .then(country => {
                        let actual_depth = utils.get_depth(country.geometry.coordinates);
                        expect(actual_depth).to.equal(depth);
                    });
                });
                return Promise.all(promises);
            });
        });
    });
    describe("Test Clustering", function() {
        describe("For array of objects holding information about intersections", function() {
            it("Got Correct Split", () => {
                let objs = [{x: 3}, {x: 4}, {x: 5}, {x: 1000}, {x: 1002}];
                let actual = utils.cluster(objs, "x", 1);
                let actual_number_of_clusters = actual.length;
                expect(actual_number_of_clusters).to.equal(3);
                expect(actual[0].length).to.equal(3);
                expect(actual[1].length).to.equal(1);
                expect(actual[2].length).to.equal(1);
            });
        });
    });
    describe("Test Coupling", function() {
        it("Got Correct Couples", () => {
            let items = [0, 1, 18, 77, 99, 103];
            let actual = utils.couple(items);
            expect(actual).to.have.lengthOf(items.length / 2);
            actual.map(couple => {
                expect(couple).to.have.lengthOf(2);
            });
        });
    });
    describe("Test Categorization of Intersections", function() {
        describe("For sample of intersections", function() {
            it("Got Correct Categorization", () => {
                // through
                let segments = [{xmin: -140, xmax: -140, direction: 1}];
                let actual = utils.categorize_intersection(segments);
                expect(actual.through).to.equal(true);
                expect(actual.xmin).to.equal(-140);
                expect(actual.xmax).to.equal(-140);

                // rebound
                segments = [{xmin: -140, xmax: -140, direction: 1},{xmin: -140, xmax: -140, direction: -1}];
                actual = utils.categorize_intersection(segments);
                expect(actual.through).to.equal(false);
                expect(actual.xmin).to.equal(-140);
                expect(actual.xmax).to.equal(-140);

                // horizontal through
                segments = [{xmin: -140, xmax: -140, direction: 1},{xmin: -140, xmax: -130, direction: 0},{xmin: -130, xmax: -130, direction: 1}];
                actual = utils.categorize_intersection(segments);
                expect(actual.through).to.equal(true);
                expect(actual.xmin).to.equal(-140);
                expect(actual.xmax).to.equal(-130);

                // horizontal rebound
                segments = [{xmin: -140, xmax: -140, direction: 1},{xmin: -140, xmax: -130, direction: 0},{xmin: -130, xmax: -130, direction: -1}];
                actual = utils.categorize_intersection(segments);
                expect(actual.through).to.equal(false);
                expect(actual.xmin).to.equal(-140);
                expect(actual.xmax).to.equal(-130);

                // through with stop
                segments = [{xmin: -140, xmax: -140, direction: 1}, {xmin: -140, xmax: -140, direction: 1}];
                actual = utils.categorize_intersection(segments);
                expect(actual.through).to.equal(true);
                expect(actual.xmin).to.equal(-140);
                expect(actual.xmax).to.equal(-140);

            });
        });
    });
}

test();

module.exports = test;
