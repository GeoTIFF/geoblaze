import wrapGeom from "../wrap-geom";
import wrapParse from "../wrap-parse";
import modeCore from "./mode.core";

export default function mode(...rest) {
  return wrapParse(wrapGeom(modeCore))(...rest);
}