import wrapGeom from "../wrap-geom";
import wrapParse from "../wrap-parse";
import meanCore from "./mean.core";

export default function mean(...rest) {
  return wrapParse(wrapGeom(meanCore))(...rest);
}