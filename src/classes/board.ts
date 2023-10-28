import { typeDistribution, CellType } from "../util/customTypes";
import defaults from "../util/defaults";
import { Cell } from "./cell";

export class Board {
	cells: Cell[][] = [];

	private _minesFrequency: number;
	private _width: number;
	private _height: number;

	constructor(width: number, height: number, minesFreq: number, distribution: typeDistribution = defaults.typeDistribution) {
		this.validateDistribution(distribution);

		this._minesFrequency = minesFreq;
		this._width = width;
		this._height = height;

		this.fillBoard(distribution);

		this.determineCellValues();
		this.DBG_printCellValues();
		this.updateCSSVariables(width, height);
	}

	private fillBoard(distribution: typeDistribution) {
		const urn = this.createUrn(distribution);

		for (let i = 0; i < this._height; i++) {
			this.cells.push([]);

			for (let j = 0; j < this._width; j++) {
				this.appendCell(i, j, urn.pop());
			}
		}
	}

	private appendCell(x: number, y: number, cellType: CellType): void {
		const app = document.getElementById("app"); //später aus gameMaster importieren
		if (!app) throw new Error("board: appendCell: No #app div found");

		const HTMLElement = document.createElement("button");
		const cell = new Cell(cellType, this, x, y, HTMLElement);
		app.appendChild(HTMLElement);
		this.cells[x].push(cell);
	}

	private createUrn(distribution: typeDistribution) {
		const cellCount = this._width * this._height;
		const badCellCount = this._minesFrequency * cellCount;
		const lastEmptyCell = cellCount * (1 - this._minesFrequency);
		const urn = new Array(cellCount).fill(CellType.Empty, 0, lastEmptyCell - 1);
		urn.fill(CellType.Boss, lastEmptyCell - 1, lastEmptyCell);

		const lastBatCell = lastEmptyCell + distribution.Rat * badCellCount;
		const lastZombieCell = lastBatCell + distribution.Zombie * badCellCount;
		const lastSkeletonCell = lastZombieCell + distribution.Skeleton * badCellCount;
		const lastGhostCell = lastSkeletonCell + distribution.Ghost * badCellCount;
		const lastWitchCell = lastGhostCell + distribution.Witch * badCellCount;
		const lastBossCell = lastWitchCell + distribution.Boss * badCellCount;

		urn.fill(CellType.Rat, lastEmptyCell, lastBatCell);
		urn.fill(CellType.Zombie, lastBatCell, lastZombieCell);
		urn.fill(CellType.Skeleton, lastZombieCell, lastSkeletonCell);
		urn.fill(CellType.Ghost, lastSkeletonCell, lastGhostCell);
		urn.fill(CellType.Witch, lastGhostCell, lastWitchCell);
		urn.fill(CellType.Boss, lastWitchCell, lastBossCell);

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

	evoluteMonster() {
		const remainingMonster = this.getRemainingMonster();

		remainingMonster.forEach(cell => {
			if (Math.random() <= defaults.boardDefaults.evolutionRate && cell.type < CellType.Witch) {
				cell.type += 1;
			}
		});

		this.determineCellValues();
		this.DBG_printCellValues();
	}

	getRemainingMonster(): Cell[] {
		let remainingMonster: Cell[] = [];

		this.cells.forEach((row) => {
			row.forEach((cell) => {
				if (!cell.isAnyNeighborClicked() && cell.type > CellType.Empty && !cell.isClicked) {
					remainingMonster.push(cell);
				}
			});
		});

		return remainingMonster;
	}

	public removeEventHandler() {
		for (let i = 0; i < this._height; i++) {
			for (let j = 0; j < this._width; j++) {
				this.cells[i][j].removeEventListeners();
			}
		}
	}

	private updateCSSVariables(gridCols: number, gridRows: number) {
		const root = document.querySelector(":root") as HTMLElement;
		if (!root) throw new Error("No :root found");
		root.style.setProperty("--cols", gridCols.toString());
		root.style.setProperty("--rows", gridRows.toString());
	}

	private validateDistribution(distribution: typeDistribution): true {
		let proportionSum = 0;
		for (const [_key, value] of Object.entries(distribution)) proportionSum += value;
		if (Math.abs(proportionSum - 1) < Number.EPSILON) return true;
		else throw new Error("Provided typeDistribution doesn't sum to 1. Sum of proportions is " + proportionSum);
	}

	private DBG_printCellValues(): void {
		let result = "";
		this.cells.forEach((row) => {
			let line = "";
			row.forEach((cell) => {
				if (cell.type === CellType.Empty) line += cell.value + "\t";
				else line += cell.translateType(cell.type) + "\t";
			});
			result += line.trim() + "\n";
		});
		console.log(result.trim());
	}
}