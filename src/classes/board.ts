import { Cell, CellType } from "./cell";

export class Board {
	cells: Cell[][] = [];

	private _minesFrequency: number;

	constructor(width: number, height: number, minesFreq: number) {
		this._minesFrequency = minesFreq;

		for (let i = 0; i < height; i++) {
			this.cells.push([]);

			for (let j = 0; j < width; j++) {
				this.appendCell(i, j);
			}
		}

		this.determineCellValues();
		this.DBG_printCellValues();
		this.updateCSSVariables(width, height);
	}

	private appendCell(x: number, y: number): void {
		const app = document.getElementById("app"); //später aus gameMaster importieren
		if (!app) throw new Error("No #app div found");

		const HTMLElement = document.createElement("button");
		const cell = new Cell(this.determineCellType(), this, x, y, HTMLElement);
		app.appendChild(HTMLElement);
		this.cells[x].push(cell);
	}

	private determineCellType(): CellType {
		const number = Math.random();

		if (number <= this._minesFrequency) {
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
		return this.getCell(i, j) ? this.cells[i][j].type : CellType.Empty;
	}

	getCell(x: number, y: number): Cell | undefined {
		if (this.cells[x] && this.cells[x][y]) {
			return this.cells[x][y];
		} else {
			return undefined;
		}
	}

	private updateCSSVariables(gridCols: number, gridRows: number) {
		const root = document.querySelector(":root") as HTMLElement;
		if (!root) throw new Error("No :root found");
		root.style.setProperty("--cols", gridCols.toString());
		root.style.setProperty("--rows", gridRows.toString());
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