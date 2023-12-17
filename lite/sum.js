import stat from "./stat";

export default function sum(georaster, geometry, test) {
  return stat(georaster, geometry, "sum", test);
}
