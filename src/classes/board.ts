import { Cell, CellType } from "./cell";

interface typeDistribution {
	Bat: number,
	Zombie: number,
	Skeleton: number,
	Ghost: number,
	Boss: number
}

export class Board {
	cells: Cell[][] = [];

	private _minesFrequency: number;
	private _width: number;
	private _height: number;

	constructor(width: number, height: number, minesFreq: number) {
		this._minesFrequency = minesFreq;
		this._width = width;
		this._height = height;

		const distribution: typeDistribution = { Bat: 0.4, Zombie: 0.3, Skeleton: 0.1, Ghost: 0.1, Boss: 0.1 };
		this.fillBoard(distribution);

		this.determineCellValues();
		this.DBG_printCellValues();
		this.updateCSSVariables(width, height);
	}

	private fillBoard(distribution: typeDistribution) {
		const urn = this.createUrn(distribution);
		console.log(urn);

		for (let i = 0; i < this._height; i++) {
			this.cells.push([]);

			for (let j = 0; j < this._width; j++) {
				this.appendCell(i, j, urn.pop());
			}
		}
	}

	private appendCell(x: number, y: number, cellType: CellType): void {
		const app = document.getElementById("app"); //später aus gameMaster importieren
		if (!app) throw new Error("No #app div found");

		const HTMLElement = document.createElement("button");
		const cell = new Cell(cellType, this, x, y, HTMLElement);
		app.appendChild(HTMLElement);
		this.cells[x].push(cell);
	}

	private createUrn(distribution: typeDistribution) {
		const cellCount = this._width * this._height;
		const badCellCount = this._minesFrequency * cellCount;
		const lastEmptyCell = cellCount * (1 - this._minesFrequency);
		const lastBatCell = lastEmptyCell + distribution.Bat * badCellCount;
		const lastZombieCell = lastBatCell + distribution.Zombie * badCellCount;
		const lastSkeletonCell = lastZombieCell + distribution.Skeleton * badCellCount;
		const lastGhostCell = lastSkeletonCell + distribution.Ghost * badCellCount;
		const lastBossCell = lastGhostCell + distribution.Boss * badCellCount;

		const urn = new Array(cellCount).fill(CellType.Empty, 0, lastEmptyCell);

		urn.fill(CellType.Bat, lastEmptyCell, lastBatCell);
		urn.fill(CellType.Zombie, lastBatCell, lastZombieCell);
		urn.fill(CellType.Skeleton, lastZombieCell, lastSkeletonCell);
		urn.fill(CellType.Ghost, lastSkeletonCell, lastGhostCell);
		urn.fill(CellType.Boss, lastGhostCell, lastBossCell);

		return urn.sort(() => (0.5 - Math.random()));
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