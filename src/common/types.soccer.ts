import type teamStats from "../worker/core/team/stats.soccer";

// Should all the extra ones be in teamStats["derived"]?
export type TeamStatAttr =
	| typeof teamStats["raw"][number]
	| "g"
	| "a"
	| "sa"
	| "sPct"
	| "svPct"
	| "foPct"
	| "ppPct"
	| "gaa"
	| "oppG"
	| "oppA"
	| "oppAa"
	| "oppSPct"
	| "oppSvPct"
	| "oppFoPct"
	| "oppPpPct"
	| "oppGaa";

type AwardTeam = {
	tid: number;
	abbrev: string;
	region: string;
	name: string;
	won: number;
	lost: number;
	tied: number | undefined;
	otl: number | undefined;
};

export type AwardPlayer = {
	pid: number;
	name: string;
	tid: number;
	pos: string;
	keyStats: string;
};

export type Awards = {
	season: number;
	bestRecord: AwardTeam;
	bestRecordConfs: (AwardTeam | undefined)[];

	// Only in old leagues
	bre?: AwardTeam;
	brw?: AwardTeam;

	roy: AwardPlayer | undefined;
	mvp: AwardPlayer | undefined;
	allLeague: [
		{
			title: "Best XI";
			players: AwardPlayer[];
		},
	];
	dpoy: AwardPlayer;
	goy: AwardPlayer;
	gbt: AwardPlayer;
	finalsMvp: AwardPlayer | undefined;
};

export type Position = "GK" | "CB" | "FB" | "CM" | "W" | "F";

export type PlayerRatings = {
	hgt: number;
	stre: number;
	spd: number;
	endu: number;
	jmp: number;
	dps: number;
	ops: number;
	agr: number;
	vis: number;
	drb: number;
	tck: number;
	sht: number;
	pss: number;
	set: number;
	glk: number;
	fuzz: number;
	injuryIndex?: number;
	locked?: boolean;
	ovr: number;
	pot: number;
	ovrs: Record<Position, number>;
	pots: Record<Position, number>;
	pos: string;
	season: number;
	skills: string[];
};

export type RatingKey =
	| "hgt"
	| "stre"
	| "spd"
	| "endu"
	| "jmp"
	| "dps"
	| "ops"
	| "agr"
	| "vis"
	| "drb"
	| "tck"
	| "sht"
	| "pss"
	| "set"
	| "glk";
