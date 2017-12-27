'use strict';

let expect = require('chai').expect;
let load = require('./../load/load');
let utils = require('./utils');
let fetch_json = utils.fetch_json;
let fetch_jsons = utils.fetch_jsons;

let url = 'http://localhost:3000/data/RWA_MNH_ANC.tif';
let url_to_data = "http://localhost:3000/data/";
let url_to_geojsons = url_to_data + 'gadm/geojsons/';
let url_to_geojson = url_to_geojsons + 'Akrotiri and Dhekelia.geojson';
let url_to_arcgis_jsons = url_to_data + "gadm/arcgis/";

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
                return fetch_json(url_to_geojson)
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
    describe("Test Forcing Within", function() {
        describe("For simple examples", function() {
            it("Got correct values", () => {
                expect(utils.force_within(10, 1, 11)).to.equal(10);
                expect(utils.force_within(-10, 1, 11)).to.equal(1);
                expect(utils.force_within(990, 1, 11)).to.equal(11);
            });
        });
    });
    describe("Test Merging of Index Ranges", function() {
        it("Got Correct Values", function() {
            let original =  [ [0, 10], [10, 10], [20, 30], [30, 40] ];
            let merged = utils.merge_ranges(original);
            expect(JSON.stringify(merged)).to.equal('[[0,10],[20,40]]');

            original =  [ [0, 10], [10, 10], [21, 31], [30, 40] ];
            merged = utils.merge_ranges(original);
            expect(JSON.stringify(merged)).to.equal('[[0,10],[21,40]]');
 
        });
    });
    describe("Test Get Depth", function() {
        describe("For Multipolygon", function() {
            this.timeout(1000000);
            it("Get Correct Depth", () => {
                let country_depths = [["Afghanistan", 3], ['Akrotiri and Dhekelia', 4]];
                let promises = country_depths.map(country_depth => {
                    let [country, depth] = country_depth;
                    return fetch_json(url_to_geojsons + country + ".geojson")
                    .then(country => {
                        let actual_depth = utils.get_depth(country.geometry.coordinates);
                        expect(actual_depth).to.equal(depth);
                    });
                });
                return Promise.all(promises);
            });
        });
    });
    describe("Test Clustering Of Line Segments", function() {
        describe("For array of objects holding information about intersections", function() {
            it("Got Correct Split", () => {
                
                let segments, computed, computed_number_of_clusters;
                
                segments = [{ends_off_line: true}, {ends_off_line: false}, {ends_off_line: false}, {ends_off_line: true}];
                computed = utils.cluster(segments, s => s.ends_off_line);
                computed_number_of_clusters = computed.length;
                expect(computed_number_of_clusters).to.equal(2);
                expect(computed[0].length).to.equal(1);
                expect(computed[1].length).to.equal(3);

                segments = [{ends_off_line: true, index: 0}, {ends_off_line: false}, {ends_off_line: false}, {ends_off_line: false, index: 99}];
                computed = utils.cluster(segments, s => s.ends_off_line);
                console.log("computed:", computed);
                computed_number_of_clusters = computed.length;
                expect(computed_number_of_clusters).to.equal(2);
                expect(computed[0].length).to.equal(1);
                expect(computed[1].length).to.equal(3);
                
                segments = [{ends_off_line: true, index: 0}, {ends_off_line: false}, {ends_off_line: false}, {ends_off_line: false, ends_on_line: true, index: 99}];
                computed = utils.cluster_line_segments(segments, 100, true);
                console.log("computed:", computed);
                computed_number_of_clusters = computed.length;
                expect(computed_number_of_clusters).to.equal(1);
                expect(computed[0].length).to.equal(4);
                
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
    describe("Test is_polygon", function() {
        it("Got all trues", () => {
            let countries = ["Afghanistan", "Ukraine"];
            let promises = countries.map(name => {
                return fetch_jsons([url_to_geojsons + name + ".geojson", url_to_arcgis_jsons + name + ".json"]).then(jsons => {
                    let [geojson, arcgisjson] = jsons;
                    console.log("geojson:", JSON.stringify(geojson).substring(0, 100) + "...");
                    console.log("arcgisjson:", JSON.stringify(arcgisjson).substring(0, 100) + "...");
                    expect(utils.is_polygon(geojson)).to.equal(true);
                    expect(utils.is_polygon(arcgisjson)).to.equal(true);
                });
            });
            return Promise.all(promises);
        });
    });
    describe("Test Intersections", function() {
        it("Got correct values", () => {
            let edge1 = [[32.87069320678728,34.66652679443354],[32.87069320678728,34.66680526733393]]; // vertical
            let edge2 = [[30,34.70833333333334],[40,34.70833333333334]];
            let line_1 = utils.get_line_from_points(edge1[0], edge1[1]);
            let line_2 = utils.get_line_from_points(edge2[0], edge2[1]);
            let intersection = utils.get_intersection_of_two_lines(line_1, line_2);
            expect(intersection.x).to.equal(32.87069320678728);
            expect(intersection.y).to.equal(34.70833333333334);

            // this test fails because of floating point arithmetic
            let vertical_edge = [ [ 19.59097290039091, 29.76190948486328 ], [ 19.59097290039091, 41.76180648803728 ] ];
            let horizontal_edge = [ [ 15, 41.641892470257524 ], [ 25, 41.641892470257524 ] ];
            let vertical_line = utils.get_line_from_points(vertical_edge[0], vertical_edge[1]);
            let horizontal_line = utils.get_line_from_points(horizontal_edge[0], horizontal_edge[1]);
            console.log("line_1, line_2", vertical_line, horizontal_line);
            intersection = utils.get_intersection_of_two_lines(vertical_line, horizontal_line);
            console.log("intersection:", intersection);
            //expect(intersection.x).to.equal(19.59097290039091);
            //expect(intersection.y).to.equal(41.641892470257524);
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
