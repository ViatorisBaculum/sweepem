export enum CellType { Empty, Bat, Zombie, Skeleton, Ghost, Boss };

export class Cell {
	type: CellType;
	value?: number;

	constructor(type: CellType, value?: number) {
		this.type = type;
		this.value = value;
	}
}