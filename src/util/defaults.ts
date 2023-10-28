import { typeDistribution, playerClasses } from "./customTypes";

const typeDistribution: typeDistribution = {
	Bat: 0.4,
	Zombie: 0.3,
	Skeleton: 0.1,
	Ghost: 0.1,
	Boss: 0.1
};

const expToNextLevel: number[] = [100, 200, 300, 400];

const boardDefaults = {
	width: 40,
	height: 20,
	minesFrequency: 0.15,
	evolutionRate: 0.2
};

const playerClass: playerClasses = "Warrior";

export default { typeDistribution, expToNextLevel, boardDefaults, playerClass };
