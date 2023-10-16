import { Cell, CellType } from "./cell";

export class Board {
    cells:Cell[][] = [];

    constructor(width:number, height:number, minesFreq:number) {
        for (let i = 0; i < height; i++) {
            this.cells.push([]);
            
            for (let j = 0; j < width; j++) {
                this.cells[i].push(new Cell(this.determineType(minesFreq)));
            }
        }
    }

    determineType(frequency:number):CellType {
        const number = Math.random();

        if (number <= frequency) {
            return CellType.Bat;
        } else {
            return CellType.Empty;
        }
    }
}