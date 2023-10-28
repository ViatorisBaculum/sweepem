export interface typeDistribution {
	Rat: number;
	Zombie: number;
	Skeleton: number;
	Ghost: number;
	Witch: number;
	Boss: number;
}

export enum CellType {
	Empty,
	Rat,
	Zombie,
	Skeleton,
	Ghost,
	Witch,
	Boss
};

export type playerClasses = "Assassin" | "Warrior" | "Paladin" | "Mage";