import wrapGeom from "../wrap-geom";
import histogramCore from "./histogram.core";

export default function histogram(...rest) {
  return wrapGeom(histogramCore)(...rest);
}
