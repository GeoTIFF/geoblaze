import test from 'flug';
import load from '../load';
import identify from './identify.module';

const url = 'http://localhost:3000/data/test.tiff';
const point = [80.63, 7.42];
const expectedValue = 350.7;

test('Identified Point Correctly', async ({ eq }) => {
  const georaster = await load(url);
  const value = identify(georaster, point)[0];
  eq(value, expectedValue);
});

test('Try to identify point outside raster and correctly returned null', async ({ eq }) => {
  const georaster = await load(url);
  const value = identify(georaster, [-200, 7.42]);
  eq(value, null);
});
