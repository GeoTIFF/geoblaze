'use strict';

let expect = require('chai').expect;
let load = require('./../load/load');
let utils = require('./utils');

let url = 'http://localhost:3000/data/RWA_MNH_ANC.tif';

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
                    let actual_bbox = utils.convert_latlng_bbox_to_image_bbox(georaster, bbox_with_buffer);
                    expect(actual_bbox.xmin).to.be.below(0);
                    expect(actual_bbox.xmin).to.be.below(actual_bbox.xmax);
                    expect(actual_bbox.ymin).to.be.below(0);
                    expect(actual_bbox.ymin).to.be.below(actual_bbox.ymax);
                });
            });
        });
    })
}

test();

module.exports = test;
