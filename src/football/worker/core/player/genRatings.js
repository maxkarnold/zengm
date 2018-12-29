// @flow

import { PLAYER } from "../../../../deion/common";
import { player } from "../../../../deion/worker/core";
import { helpers, overrides, random } from "../../../../deion/worker/util";
import { RATINGS, POSITION_COUNTS } from "../../../common";
import type { PlayerRatings, RatingKey } from "../../../common/types";

const getPos = () => {
    const numPlayers = Object.values(POSITION_COUNTS).reduce(
        (sum, val) => sum + val,
        0,
    );
    const rand = Math.random() * numPlayers;
    let cumsum = 0;
    for (const [pos, count] of Object.entries(POSITION_COUNTS)) {
        cumsum += count;
        if (rand < cumsum) {
            return pos;
        }
    }

    throw new Error("No position found - this should never happen!");
};

const getRatingsToBoost = (pos: string) => {
    if (pos === "QB") {
        return {
            hgt: 1,
            spd: 0.5,
            thv: 1,
            thp: 1,
            tha: 1,
            bsc: 0.25,
        };
    }
    if (pos === "RB") {
        return {
            spd: 1,
            bsc: 1,
            elu: 1,
            rtr: 0.5,
            hnd: 0.5,
        };
    }
    if (pos === "WR") {
        return {
            hgt: 1,
            spd: 1,
            elu: 0.5,
            rtr: 1,
            hnd: 1,
        };
    }
    if (pos === "TE") {
        return {
            hgt: 1,
            stre: 0.5,
            spd: 1,
            elu: 0.5,
            rtr: 1,
            hnd: 1,
            rbk: 0.5,
        };
    }
    if (pos === "OL") {
        return {
            hgt: 1,
            stre: 1,
            rbk: 1,
            pbk: 1,
        };
    }
    if (pos === "DL") {
        return {
            hgt: 1,
            stre: 1,
            prs: 1,
            rns: 1,
        };
    }
    if (pos === "LB") {
        return {
            hgt: 0.5,
            stre: 0.5,
            spd: 0.5,
            pcv: 0.5,
            prs: 0.5,
            rns: 0.5,
        };
    }
    if (pos === "CB") {
        return {
            spd: 1,
            pcv: 1,
        };
    }
    if (pos === "S") {
        return {
            stre: 0.25,
            spd: 0.5,
            pcv: 0.5,
            rns: 0.5,
        };
    }
    if (pos === "K") {
        return {
            kpw: 1,
            kac: 1,
        };
    }
    if (pos === "P") {
        return {
            ppw: 1,
            pac: 1,
        };
    }

    throw new Error(`Invalid position "${pos}"`);
};

/**
 * Generate initial ratings for a newly-created player.
 *
 * @param {number} season [description]
 * @param {number} scoutingRank Between 1 and g.numTeams (default 30), the rank of scouting spending, probably over the past 3 years via core.finances.getRankLastThree.
 * @param {number} tid [description]
 * @return {Object} Ratings object
 */
const genRatings = (
    season: number,
    scoutingRank: number,
    tid: number,
): { heightInInches: number, ratings: PlayerRatings } => {
    const heightInInches = 72;

    const pos = getPos();
    const rawRatings = RATINGS.reduce((ratings, rating) => {
        ratings[rating] = player.limitRating(random.truncGauss(20, 20, 0, 70));
        return ratings;
    }, {});

    const ratingsToBoost = getRatingsToBoost(pos);
    for (const [rating, factor] of Object.entries(ratingsToBoost)) {
        rawRatings[rating] = player.limitRating(
            (rawRatings[rating] += factor * random.truncGauss(20, 20, 10, 30)),
        );
    }

    const ratings = {
        hgt: rawRatings.hgt,
        stre: rawRatings.stre,
        spd: rawRatings.spd,
        endu: rawRatings.endu,
        thv: rawRatings.thv,
        thp: rawRatings.thp,
        tha: rawRatings.tha,
        bsc: rawRatings.bsc,
        elu: rawRatings.elu,
        rtr: rawRatings.rtr,
        hnd: rawRatings.hnd,
        rbk: rawRatings.rbk,
        pbk: rawRatings.pbk,
        pcv: rawRatings.pcv,
        prs: rawRatings.prs,
        rns: rawRatings.rns,
        kpw: rawRatings.kpw,
        kac: rawRatings.kac,
        ppw: rawRatings.ppw,
        pac: rawRatings.pac,
        fuzz: player.genFuzz(scoutingRank),
        ovr: 0,
        pos,
        pot: 0,
        season,
        skills: [],
    };

    if (tid === PLAYER.UNDRAFTED_2) {
        ratings.fuzz *= Math.sqrt(2);
    } else if (tid === PLAYER.UNDRAFTED_3) {
        ratings.fuzz *= 2;
    }

    if (!overrides.core.player.pos) {
        throw new Error("Missing overrides.core.player.pos");
    }
    ratings.pos = overrides.core.player.pos(ratings);
    console.log(pos, ratings.pos);

    return {
        heightInInches,
        ratings,
    };
};

export default genRatings;
