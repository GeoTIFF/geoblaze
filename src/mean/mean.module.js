import stats from "../stats";
import utils from "../utils";

export default function mean(georaster, geometry) {
  return utils.resolve(stats(georaster, geometry, { calcMean: true })).then(stats => stats.map(({ mean }) => mean));
}
