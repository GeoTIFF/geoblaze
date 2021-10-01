import test from 'flug';
import fetch from 'cross-fetch';
import load from '../load';
import identify from './identify.module';

const url = 'http://localhost:3000/data/test.tiff';
const point = [80.63, 7.42];
const expectedValue = 350.7;

test('Identified Point Correctly from file', async ({ eq }) => {
  const georaster = await fetch(url).then(r => r.arrayBuffer()).then(load);
  const values = identify(georaster, point)[0];
  eq(values, expectedValue);
});

test('Try to identify point outside raster and correctly returned null from file', async ({ eq }) => {
  const georaster = await fetch(url).then(r => r.arrayBuffer()).then(load);
  const value = identify(georaster, [-200, 7.42]);
  eq(value, null);
});

test('Identified Point Correctly from URL', async ({ eq }) => {
  const georaster = await load(url);
  const values = await identify(georaster, point);
  eq(values[0], expectedValue);
});

test('Try to identify point outside raster and correctly returned null from URL', async ({ eq }) => {
  const georaster = await load(url);
  const value = await identify(georaster, [-200, 7.42]);
  eq(value, null);
});
