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

const monsterKeys = {
	0: "E",
	1: "R¹",
	2: "Z²",
	3: "S³",
	4: "G⁴",
	5: "W⁵",
	6: "B⁶"
}

const experienceGain = {
	open: 1, // experience gained by opening a cell
	multiplicator: 3 // multiplicator for experience gained by defeating monsters
}

const playerClass: playerClasses = "Warrior";

export default { typeDistribution, expToNextLevel, boardDefaults, playerClass, monsterKeys, experienceGain };
