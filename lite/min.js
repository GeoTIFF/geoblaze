import stat from "./stat";

export default function min(georaster, geometry, test) {
  return stat(georaster, geometry, "min", test);
}
