import { finances } from "..";
import { bySport, isSport } from "../../../common";
import type { TeamSeason } from "../../../common/types";
import { idb } from "../../db";
import { g, helpers, random } from "../../util";

const PLAYOFF_ATTENDANCE_FACTOR = 1.5;

export const getBaseAttendance = ({
	hype,
	pop,
	playoffs,
}: {
	hype: number;
	pop: number;
	playoffs: boolean;
}) => {
	let baseAttendance = 10000 + (0.1 + 0.9 * hype ** 2) * pop * 1000000 * 0.01;

	if (isSport("hockey")) {
		baseAttendance *= 1.05;
	} else if (isSport("football")) {
		baseAttendance *= 28;
	}

	if (playoffs) {
		baseAttendance *= PLAYOFF_ATTENDANCE_FACTOR;
	}

	return baseAttendance;
};

// In the playoffs, auto-adjust ticket price up, accounting for the increase in baseAttendance
export const getAdjustedTicketPrice = (
	ticketPrice: number,
	playoffs: boolean,
) => {
	if (!playoffs) {
		return ticketPrice;
	}

	return Math.sqrt(PLAYOFF_ATTENDANCE_FACTOR) * ticketPrice;
};

// Ticket price adjusted for the salary cap, so it can be used in attendance calculation without distorting things for leagues with low/high caps. The exponential factor was hand-tuned to make this work in 1965.
const salaryCapFactor = () => (90000 / g.get("salaryCap")) ** 0.75;

// Adjustment added after auto ticket prices, to keep overall finances about the same as before auto ticket prices existed
const SPORT_FACTOR = bySport({
	basketball: 0.75,
	football: 0.0575,
	hockey: 0.35,
});

const TICKET_PRICE_FACTOR = 45 * 50;

const facilitiesFactor = (teamSeasons: TeamSeason[]) =>
	1 +
	(0.075 *
		(g.get("numActiveTeams") -
			finances.getRankLastThree(teamSeasons, "expenses", "facilities"))) /
		(g.get("numActiveTeams") - 1);

// teamSeasons is last 3 seasons
export const getActualAttendance = ({
	baseAttendance,
	randomize,
	stadiumCapacity,
	teamSeasons,
	adjustedTicketPrice,
}: {
	baseAttendance: number;
	randomize: boolean;
	stadiumCapacity: number;
	teamSeasons: TeamSeason[];
	adjustedTicketPrice: number;
}) => {
	const relativeTicketPrice = adjustedTicketPrice * salaryCapFactor();

	let attendance = baseAttendance;

	attendance *= SPORT_FACTOR;

	if (randomize) {
		attendance = random.gauss(attendance, 1000);
	}

	// Attendance depends on ticket price
	attendance *= TICKET_PRICE_FACTOR / relativeTicketPrice ** 2;

	// Attendance depends on facilities
	attendance *= facilitiesFactor(teamSeasons);

	attendance = helpers.bound(attendance, 0, stadiumCapacity);
	attendance = Math.round(attendance);

	return attendance;
};

// Takes attendance (stadiumCapacity) and returns ticketPrice, rather than taking adjustedTicketPrice and returning attendance. This assumes baseAttendance was calculated with playoffs: false
export const getActualAttendanceInverted = ({
	baseAttendance,
	stadiumCapacity,
	teamSeasons,
}: {
	baseAttendance: number;
	stadiumCapacity: number;
	teamSeasons: TeamSeason[];
}) => {
	let temp = stadiumCapacity;

	temp /= facilitiesFactor(teamSeasons);
	temp /= TICKET_PRICE_FACTOR;
	temp /= SPORT_FACTOR;
	temp /= baseAttendance;

	let ticketPrice = Math.sqrt(1 / temp);
	ticketPrice /= salaryCapFactor();

	if (ticketPrice < 0) {
		return 0.01;
	}

	return Math.round(ticketPrice * 100) / 100;
};

export const getAutoTicketPrice = ({
	hype,
	pop,
	stadiumCapacity,
	teamSeasons,
}: {
	hype: number;
	pop: number;
	stadiumCapacity: number;
	teamSeasons: TeamSeason[];
}) => {
	if (stadiumCapacity <= 0) {
		return 50;
	}

	const baseAttendance = getBaseAttendance({
		hype,
		pop,
		playoffs: false,
	});

	return getActualAttendanceInverted({
		baseAttendance,
		stadiumCapacity,
		teamSeasons,
	});
};

export const getAutoTicketPriceByTid = async (tid: number) => {
	const teamSeasons = await idb.cache.teamSeasons.indexGetAll(
		"teamSeasonsByTidSeason",
		[
			[tid, g.get("season") - 2],
			[tid, g.get("season")],
		],
	);

	if (teamSeasons.length === 0) {
		throw new Error("No team season found");
	}

	const teamSeason = teamSeasons[teamSeasons.length - 1];

	return getAutoTicketPrice({
		hype: teamSeason.hype,
		pop: teamSeason.pop,
		stadiumCapacity: teamSeason.stadiumCapacity,
		teamSeasons,
	});
};
