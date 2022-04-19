import wrapGeom from "../wrap-geom";
import wrapParse from "../wrap-parse";
import modesCore from "./modes.core";

export default function modes(...rest) {
  return wrapParse(wrapGeom(modesCore))(...rest);
}