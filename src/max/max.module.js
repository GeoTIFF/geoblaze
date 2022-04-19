import wrapGeom from "../wrap-geom";
import wrapParse from "../wrap-parse";
import maxCore from "./max.core";

export default function max(...rest) {
  return wrapParse(wrapGeom(maxCore))(...rest);
}