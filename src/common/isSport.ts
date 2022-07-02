const isSport = (
	sport: "baseball" | "basketball" | "football" | "hockey" | "soccer",
) => {
	return sport === process.env.SPORT;
};

export default isSport;
