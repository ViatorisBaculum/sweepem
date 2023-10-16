export enum CellType{Empty, Bat, Zombie, Skeleton, Ghost, Boss};

export class Cell {
    type:CellType;

    constructor(type:CellType) {
        this.type = type;
    }
}