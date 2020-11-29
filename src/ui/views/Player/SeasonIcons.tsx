import React from "react";
import type { Player } from "../../../common/types";

const SeasonIcons = ({
	season,
	awards,
	playoffs,
}: {
	season: number;
	awards: Player["awards"];
	playoffs?: boolean;
}) => {
	let type;
	let className;
	for (const award of awards) {
		if (award.season !== season) {
			continue;
		}

		if (playoffs) {
			if (award.type === "Won Championship") {
				type = award.type;
				className = "ring";
				break;
			}
		} else {
			if (award.type === "Most Valuable Player") {
				type = award.type;
				className = "glyphicon glyphicon-star text-yellow";
				break;
			}

			// Only show these if not MVP, so no "break" statement inside
			if (process.env.SPORT === "basketball" && award.type === "All-Star") {
				type = award.type;
				className = "glyphicon glyphicon-star text-muted";
			}
			if (
				process.env.SPORT === "football" &&
				award.type.includes("All-League")
			) {
				type = award.type;
				className = "glyphicon glyphicon-star text-muted";
			}
		}
	}

	if (type && className) {
		return (
			<span className={className} role="img" aria-label={type} title={type} />
		);
	}

	return null;
};

export default SeasonIcons;