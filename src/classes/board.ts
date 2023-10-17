import { Cell, CellType } from "./cell";

export class Board {
	cells: Cell[][] = [];

	constructor(width: number, height: number, minesFreq: number) {
		for (let i = 0; i < height; i++) {
			this.cells.push([]);

			for (let j = 0; j < width; j++) {
				this.cells[i].push(new Cell(this.determineCellType(minesFreq)));
			}
		}

		this.determineCellValues();
		this.DBG_printCellValues();
	}

	determineCellType(frequency: number): CellType {
		const number = Math.random();

		if (number <= frequency) {
			return CellType.Bat;
		} else {
			return CellType.Empty;
		}
	}

	determineCellValues(): void {
		this.cells.forEach((row, i) => {
			row.forEach((cell, j) => {
				if (cell.type === CellType.Empty) {
					let sum = 0;
					sum += this.getCellType(i - 1, j - 1);
					sum += this.getCellType(i - 1, j + 0);
					sum += this.getCellType(i - 1, j + 1);
					sum += this.getCellType(i + 0, j - 1);
					sum += this.getCellType(i + 0, j + 1);
					sum += this.getCellType(i + 1, j - 1);
					sum += this.getCellType(i + 1, j + 0);
					sum += this.getCellType(i + 1, j + 1);

					cell.value = sum;
				}
			});
		});
	}

	getCellType(i: number, j: number): CellType {
		return this.cells[i] && this.cells[i][j] ? this.cells[i][j].type : CellType.Empty;
	}

	private DBG_printCellValues(): void {
		let result = "";
		this.cells.forEach((row) => {
			let line = "";
			row.forEach((cell) => {
				if (cell.type === CellType.Empty) line += cell.value + "\t";
				else line += "M\t";
			});
			result += line.trim() + "\n";
		});
		console.log(result.trim());
	}
}