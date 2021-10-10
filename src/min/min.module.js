import stats from "../stats";
import utils from "../utils";

export default function min(georaster, geometry) {
  return utils.resolve(stats(georaster, geometry, { calcMin: true })).then(stats => stats.map(({ min }) => min));
}
