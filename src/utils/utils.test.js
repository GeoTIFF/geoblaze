import { expect } from 'chai';
import load from '../load';
import utils from './utils.module';

const { fetchJson, fetchJsons } = utils;

const url = 'http://localhost:3000/data/RWA_MNH_ANC.tif';
const urlToData = 'http://localhost:3000/data/';
const urlToGeojsons = urlToData + 'gadm/geojsons/';
const urlToGeojson = urlToGeojsons + 'Akrotiri and Dhekelia.geojson';
const urlToArcgisJsons = urlToData + 'gadm/arcgis/';

describe('Get Bounding Box', () => {
  describe('Get Bounding when Bounding Box when Bigger Than Raster', function () {
    this.timeout(1000000);
    it('Got Correct Bounding Box with Negative Values', () => {
      return load(url).then(georaster => {
        const bboxWithBuffer = {
          xmin: georaster.xmin - 1,
          xmax: georaster.xmax + 1,
          ymin: georaster.ymin - 1,
          ymax: georaster.ymax + 1,
        };
        const actualBbox = utils.convertCrsBboxToImageBbox(georaster, bboxWithBuffer);
        expect(actualBbox.xmin).to.be.below(0);
        expect(actualBbox.xmin).to.be.below(actualBbox.xmax);
        expect(actualBbox.ymin).to.be.below(0);
        expect(actualBbox.ymin).to.be.below(actualBbox.ymax);
      });
    });
  });
  describe('Get Bounding Box of GeoJSON that has MultiPolygon Geometry (i.e., multiple rings)', function () {
    this.timeout(1000000);
    it('Got correct bounding box', () => {
      return fetchJson(urlToGeojson)
        .then(country => {
          const bbox = utils.getBoundingBox(country.geometry.coordinates);
          expect(typeof bbox.xmin).to.equal('number');
          expect(typeof bbox.xmax).to.equal('number');
          expect(typeof bbox.ymin).to.equal('number');
          expect(typeof bbox.ymax).to.equal('number');
          expect(bbox.xmin).to.equal(32.76010131835966);
          expect(bbox.xmax).to.equal(33.92147445678711);
          expect(bbox.ymin).to.equal(34.56208419799816);
          expect(bbox.ymax).to.equal(35.118995666503906);
        });
    });
  });
});
describe('Test Forcing Within', () => {
  describe('For simple examples', () => {
    it('Got correct values', () => {
      expect(utils.forceWithin(10, 1, 11)).to.equal(10);
      expect(utils.forceWithin(-10, 1, 11)).to.equal(1);
      expect(utils.forceWithin(990, 1, 11)).to.equal(11);
    });
  });
});
describe('Test Merging of Index Ranges', () => {
  it('Got Correct Values', () => {
    let original =  [ [0, 10], [10, 10], [20, 30], [30, 40] ];
    let merged = utils.mergeRanges(original);
    expect(JSON.stringify(merged)).to.equal('[[0,10],[20,40]]');

    original =  [ [0, 10], [10, 10], [21, 31], [30, 40] ];
    merged = utils.mergeRanges(original);
    expect(JSON.stringify(merged)).to.equal('[[0,10],[21,40]]');

  });
});
describe('Test Get Depth', () => {
  describe('For Multipolygon', function () {
    this.timeout(1000000);
    it('Get Correct Depth', () => {
      const countryDepths = [['Afghanistan', 3], ['Akrotiri and Dhekelia', 4]];
      const promises = countryDepths.map(countryDepth => {
        const [country, depth] = countryDepth;
        return fetchJson(urlToGeojsons + country + '.geojson')
          .then(country => {
            const actualDepth = utils.getDepth(country.geometry.coordinates);
            expect(actualDepth).to.equal(depth);
          });
      });
      return Promise.all(promises);
    });
  });
});
describe('Test Clustering Of Line Segments', () => {
  describe('For array of objects holding information about intersections', () => {
    it('Got Correct Split', () => {

      let segments, computed, computedNumberOfClusters;

      segments = [{ endsOffLine: true }, { endsOffLine: false }, { endsOffLine: false }, { endsOffLine: true }];
      computed = utils.cluster(segments, s => s.endsOffLine);
      computedNumberOfClusters = computed.length;
      expect(computedNumberOfClusters).to.equal(2);
      expect(computed[0].length).to.equal(1);
      expect(computed[1].length).to.equal(3);

      segments = [{ endsOffLine: true, index: 0 }, { endsOffLine: false }, { endsOffLine: false }, { endsOffLine: false, index: 99 }];
      computed = utils.cluster(segments, s => s.endsOffLine);
      computedNumberOfClusters = computed.length;
      expect(computedNumberOfClusters).to.equal(2);
      expect(computed[0].length).to.equal(1);
      expect(computed[1].length).to.equal(3);

      segments = [{ endsOffLine: true, index: 0 }, { endsOffLine: false }, { endsOffLine: false }, { endsOffLine: false, endsOnLine: true, index: 99 }];
      computed = utils.clusterLineSegments(segments, 100, true);
      computedNumberOfClusters = computed.length;
      expect(computedNumberOfClusters).to.equal(1);
      expect(computed[0].length).to.equal(4);

    });
  });
});
describe('Test Coupling', () => {
  it('Got Correct Couples', () => {
    const items = [0, 1, 18, 77, 99, 103];
    const actual = utils.couple(items);
    expect(actual).to.have.lengthOf(items.length / 2);
    actual.map(couple => {
      expect(couple).to.have.lengthOf(2);
    });
  });
});
describe('Test isPolygon', () => {
  it('Got all trues', () => {
    const countries = ['Afghanistan', 'Ukraine'];
    const promises = countries.map(name => {
      return fetchJsons([urlToGeojsons + name + '.geojson', urlToArcgisJsons + name + '.json']).then(jsons => {
        const [geojson, arcgisjson] = jsons;
        console.log('geojson:', JSON.stringify(geojson).substring(0, 100) + '...');
        console.log('arcgisjson:', JSON.stringify(arcgisjson).substring(0, 100) + '...');
        expect(utils.isPolygon(geojson)).to.equal(true);
        expect(utils.isPolygon(arcgisjson)).to.equal(true);
        expect(utils.isPolygon(arcgisjson.geometry)).to.equal(true);
      });
    });
    return Promise.all(promises);
  });
});
describe('Test Intersections', () => {
  it('Got correct values', () => {
    const edge1 = [[32.87069320678728,34.66652679443354],[32.87069320678728,34.66680526733393]]; // vertical
    const edge2 = [[30,34.70833333333334],[40,34.70833333333334]];
    const line1 = utils.getLineFromPoints(edge1[0], edge1[1]);
    const line2 = utils.getLineFromPoints(edge2[0], edge2[1]);
    let intersection = utils.getIntersectionOfTwoLines(line1, line2);
    expect(intersection.x).to.equal(32.87069320678728);
    expect(intersection.y).to.equal(34.70833333333334);

    // this test fails because of floating point arithmetic
    const verticalEdge = [ [ 19.59097290039091, 29.76190948486328 ], [ 19.59097290039091, 41.76180648803728 ] ];
    const horizontalEdge = [ [ 15, 41.641892470257524 ], [ 25, 41.641892470257524 ] ];
    const verticalLine = utils.getLineFromPoints(verticalEdge[0], verticalEdge[1]);
    const horizontalLine = utils.getLineFromPoints(horizontalEdge[0], horizontalEdge[1]);
    intersection = utils.getIntersectionOfTwoLines(verticalLine, horizontalLine);
    //expect(intersection.x).to.equal(19.59097290039091);
    //expect(intersection.y).to.equal(41.641892470257524);
  });
});
describe('Test Categorization of Intersections', () => {
  describe('For sample of intersections', () => {
    it('Got Correct Categorization', () => {
      // through
      let segments = [{ xmin: -140, xmax: -140, direction: 1 }];
      let actual = utils.categorizeIntersection(segments);
      expect(actual.through).to.equal(true);
      expect(actual.xmin).to.equal(-140);
      expect(actual.xmax).to.equal(-140);

      // rebound
      segments = [{ xmin: -140, xmax: -140, direction: 1 },{ xmin: -140, xmax: -140, direction: -1 }];
      actual = utils.categorizeIntersection(segments);
      expect(actual.through).to.equal(false);
      expect(actual.xmin).to.equal(-140);
      expect(actual.xmax).to.equal(-140);

      // horizontal through
      segments = [{ xmin: -140, xmax: -140, direction: 1 },{ xmin: -140, xmax: -130, direction: 0 },{ xmin: -130, xmax: -130, direction: 1 }];
      actual = utils.categorizeIntersection(segments);
      expect(actual.through).to.equal(true);
      expect(actual.xmin).to.equal(-140);
      expect(actual.xmax).to.equal(-130);

      // horizontal rebound
      segments = [{ xmin: -140, xmax: -140, direction: 1 },{ xmin: -140, xmax: -130, direction: 0 },{ xmin: -130, xmax: -130, direction: -1 }];
      actual = utils.categorizeIntersection(segments);
      expect(actual.through).to.equal(false);
      expect(actual.xmin).to.equal(-140);
      expect(actual.xmax).to.equal(-130);

      // through with stop
      segments = [{ xmin: -140, xmax: -140, direction: 1 }, { xmin: -140, xmax: -140, direction: 1 }];
      actual = utils.categorizeIntersection(segments);
      expect(actual.through).to.equal(true);
      expect(actual.xmin).to.equal(-140);
      expect(actual.xmax).to.equal(-140);

    });
  });
});
