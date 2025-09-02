import { typeDistribution, playerClasses, BoardSize, Difficulty } from "./customTypes";

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

export const BoardDimensions = {
	[BoardSize.Small]: { width: 20, height: 10 },
	[BoardSize.Medium]: { width: 40, height: 20 },
	[BoardSize.Large]: { width: 60, height: 30 },
	[BoardSize.Enormous]: { width: 80, height: 40 }
};

export const DifficultySettings = {
	[Difficulty.Beginner]: { minesFrequency: 0.15, evolutionRate: 0.1 },
	[Difficulty.Intermediate]: { minesFrequency: 0.2, evolutionRate: 0.2 },
	[Difficulty.Expert]: { minesFrequency: 0.25, evolutionRate: 0.3 },
	[Difficulty.Master]: { minesFrequency: 0.3, evolutionRate: 0.4 }
};

// export const exp gain for each difficulty level
export const expGain = {
	[Difficulty.Beginner]: 1,
	[Difficulty.Intermediate]: 1.25,
	[Difficulty.Expert]: 1.5,
	[Difficulty.Master]: 1.75
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

export const revealDelayPerCell = 40;

export default { typeDistribution, expToNextLevel, boardDefaults, playerClass, monsterKeys, experienceGain, revealDelayPerCell, expGain } as const;
