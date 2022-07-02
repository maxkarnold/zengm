import { bySport } from "../../../common";
import statsBaseball from "./stats.baseball";
import statsBasketball from "./stats.basketball";
import statsFootball from "./stats.football";
import statsHockey from "./stats.hockey";
import statsSoccer from "./stats.soccer";

const stats = bySport<unknown>({
	baseball: statsBaseball,
	basketball: statsBasketball,
	football: statsFootball,
	hockey: statsHockey,
	soccer: statsSoccer,
}) as {
	derived: string[];
	raw: string[];
	byPos?: string[];
};
export default stats;
