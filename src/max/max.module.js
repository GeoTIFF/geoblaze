/**
 * @prettier
 */
import _ from "underscore";
import fastMax from "fast-max";
import get from "../get";
import wrap from "../wrap-func";
import utils from "../utils";
import convertGeometry from "../convert-geometry";
import intersectPolygon from "../intersect-polygon";

const getMaxForRaster = (georaster, geom) => {
  try {
    const { noDataValue } = georaster;

    const calcMax = values => values.map(band => fastMax(band, { no_data: noDataValue }));

    if (geom === null || geom === undefined) {
      const values = get(georaster, undefined, true);
      return utils.callAfterResolveArgs(calcMax, values);
    } else if (utils.isBbox(geom)) {
      geom = convertGeometry("bbox", geom);
      const values = get(georaster, geom, true);
      return utils.callAfterResolveArgs(calcMax, values);
    } else if (utils.isPolygon(geom)) {
      geom = convertGeometry("polygon", geom);
      const values = [];
      const done = intersectPolygon(georaster, geom, (value, bandIndex) => {
        if (!values[bandIndex]) {
          values[bandIndex] = value;
        } else if (value > values[bandIndex]) {
          values[bandIndex] = value;
        }
      });

      return utils.callAfterResolveArgs(() => {
        if (values) return values;
        else throw "No Values were found in the given geometry";
      }, done);
    } else {
      throw "Non-Bounding Box geometries are currently not supported.";
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export default wrap(getMaxForRaster);
