const posRatings = (pos: string) => {
	if (pos === "GK") {
		return ["glk"];
	}
	// physical, mental, technical, goalkeeping
	return ["drb", "spd", "stre", "hgt", "jmp", "endu", "agr", "vis"];
};

export default posRatings;
