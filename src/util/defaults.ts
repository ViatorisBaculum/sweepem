import { typeDistribution, playerClasses } from "./customTypes";

const typeDistribution: typeDistribution = {
	Rat: 0.4,
	Zombie: 0.3,
	Skeleton: 0.1,
	Ghost: 0.1,
	Witch: 0.1,
	Boss: 0
};

const expToNextLevel: number[] = [100, 200, 300, 400];

const boardDefaults = {
	width: 40,
	height: 20,
	minesFrequency: 0.3,
	evolutionRate: 0.2,
	invertClicks: false,
	removeFlags: false
};

const boardColors = {
	1: "#BFD8B8", // soft green (light, friendly)
	2: "#7EA16B", // modern olive
	3: "#5C8374", // teal (matches your theme)
	4: "#355C7D", // modern blue
	5: "#F67280"  // modern pink/coral
};

const monsterKeys = {
	0: "E",
	1: "R",
	2: "Z",
	3: "S",
	4: "G",
	5: "W",
	6: "B"
}

const experienceGain = {
	open: 1, // experience gained by opening a cell
	multiplicator: 3 // multiplicator for experience gained by defeating monsters
}

const playerClass: playerClasses = "Warrior";

export default { typeDistribution, expToNextLevel, boardDefaults, boardColors, playerClass, monsterKeys, experienceGain };
