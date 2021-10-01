import _ from 'underscore';
import fastMax from 'fast-max';
import get from '../get';
import load from '../load';
import utils from '../utils';
import convertGeometry from '../convert-geometry';
import intersectPolygon from '../intersect-polygon';


const getMaxForRaster = (georaster, geom) => {

  try {

    const { noDataValue } = georaster;

    if (geom === null || geom === undefined) {

      if (georaster.values) {
        return georaster.values.map(band => {
          let band_max;
          band.forEach(row => {
            let row_max = fastMax(row, { no_data: noDataValue });
            if (row_max !== undefined && (band_max === undefined || row_max > band_max)) band_max = row_max;
          })
          return band_max;
        });  
      } else {
        const options = { height: georaster.height, left: 0, right: georaster.width, bottom: georaster.height, top: 0, width: georaster.width };
        return georaster.getValues(options).then(values => {
          return values.map(band => {
            let band_max;
            band.forEach(row => {
              let row_max = fastMax(row, { no_data: noDataValue });
              if (row_max !== undefined && (band_max === undefined || row_max > band_max)) band_max = row_max;
            })
            return band_max;
          });
        });
      }

    } else if (utils.isBbox(geom)) {
      geom = convertGeometry('bbox', geom);

      // grab array of values;
      const flat = true;
      if (georaster.values) {
        const values = get(georaster, geom, flat);

        // get max value
        return values.map(band => fastMax(band, { no_data: noDataValue }));  
      } else {
        return get(georaster, geom, flat).then(values => (
          values.map(band => fastMax(band, { no_data: noDataValue })
        )));
      }

    } else if (utils.isPolygon(geom)) {
      geom = convertGeometry('polygon', geom);
      const values = [];

      if (georaster.values) {
        intersectPolygon(georaster, geom, (value, bandIndex) => {
          if (!values[bandIndex]) {
            values[bandIndex] = value;
          } else if (value > values[bandIndex]) {
            values[bandIndex] = value;
          }
        });
  
        if (values) return values;
        else throw 'No Values were found in the given geometry';  
      } else {
        return intersectPolygon(georaster, geom, (value, bandIndex) => {
          if (!values[bandIndex]) {
            values[bandIndex] = value;
          } else if (value > values[bandIndex]) {
            values[bandIndex] = value;
          }
        }).then(() => {
          if (values) return values;
          else throw 'No Values were found in the given geometry';  
        });
      }

    } else {
      throw 'Non-Bounding Box geometries are currently not supported.';
    }
  } catch(e) {
    console.error(e);
    throw e;
  }
};

const getMaxForRasterWrapper = (georaster, geom) => {
  if (typeof georaster === "string") {
    return load(georaster).then(loaded => getMaxForRaster(loaded, geom));
  } else {
    return getMaxForRaster(georaster, geom);
  }
}

export default getMaxForRasterWrapper;
