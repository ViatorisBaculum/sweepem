import { typeDistribution } from "./customTypes";

const typeDistribution: typeDistribution = {
	Bat: 0.4,
	Zombie: 0.3,
	Skeleton: 0.1,
	Ghost: 0.1,
	Boss: 0.1,
};

const expToNextLevel: number[] = [100, 200, 300, 400];

export default { typeDistribution, expToNextLevel };
