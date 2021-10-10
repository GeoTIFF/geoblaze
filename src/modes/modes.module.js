import stats from "../stats";
import utils from "../utils";

export default function modes(georaster, geometry) {
  return utils.resolve(stats(georaster, geometry, { calcModes: true })).then(stats => stats.map(({ modes }) => modes));
}
