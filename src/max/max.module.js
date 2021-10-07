/**
 * @prettier
 */
import stats from "../stats";
import utils from "../utils";

export default function max(georaster, geometry) {
  return utils.resolve(stats(georaster, geometry, { calcMax: true })).then(stats => stats.map(({ max }) => max));
}
