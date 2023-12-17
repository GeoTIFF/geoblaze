import stat from "./stat";

export default function mean(georaster, geometry, test) {
  return stat(georaster, geometry, "mean", test);
}
