const { expect } = require('chai');

describe('Loading Production Build', () => {
  it('Should Successfully Require Production Build in Node', () => {
    const geoblaze = require('./dist/geoblaze.min.js');
    expect(geoblaze).to.be.ok;
  });
});

describe('Loading Development Build', () => {
  it('Should Successfully Require Development Build in Node', () => {
    const geoblaze = require('./dist/geoblaze.js');
    expect(geoblaze).to.be.ok;
  });
});
