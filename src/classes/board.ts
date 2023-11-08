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

		this.writeValues(false);
	}

	/*==============*/
	/*public methods*/
	/*==============*/

	evoluteMonster() {
		const remainingMonster = this.getRemainingMonster();

		remainingMonster.forEach((cell) => {
			if (Math.random() <= defaults.boardDefaults.evolutionRate && cell.type < CellType.Witch) {
				cell.type += 1;
			}
		});

		this.determineCellValues();
		this.DBG_printCellValues();
	}

	getCell(x: number, y: number): Cell | undefined {
		if (this.cells[x] && this.cells[x][y]) {
			return this.cells[x][y];
		} else {
			return undefined;
		}
	}

	getCellType(i: number, j: number): CellType {
		return this.getCell(i, j) ? this.cells[i][j].type : CellType.Empty;
	}

	public indicateLevelGain() {
		const app = document.getElementById("app");
		if (app) {
			app.classList.remove("highlight");
			void app.offsetWidth;
			app.classList.add("highlight");
		}
	}

	public openStartArea() {
		const x = Math.round(Math.random() * (this._height - 1));
		const y = Math.round(Math.random() * (this._width - 1));
		let startCell = this.cells[x][y];
		while (startCell.value !== 0) {
			let x = Math.round(Math.random() * (this._height - 1));
			let y = Math.round(Math.random() * (this._height - 1));
			startCell = this.cells[x][y];
		}

		startCell.click();
		startCell.HTMLElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
	}

	public removeEventHandler() {
		for (let i = 0; i < this._height; i++) {
			for (let j = 0; j < this._width; j++) {
				this.cells[i][j].removeEventListeners();
			}
		}
	}

	public revealBoard() {
		this.cells.forEach((row) => {
			row.forEach((cell) => {
				if (!cell.isClicked) {
					cell.HTMLElement.classList.add("notClicked");
					cell.revealCell();
				}
			});
		});
	}

	/*===============*/
	/*private methods*/
	/*===============*/

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

		return urn.sort(() => 0.5 - Math.random());
	}

	private determineCellValues(): void {
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

	private fillBoard(distribution: typeDistribution) {
		const urn = this.createUrn(distribution);

		for (let i = 0; i < this._height; i++) {
			this.cells.push([]);
			for (let j = 0; j < this._width; j++) {
				this.appendCell(i, j, urn.pop());
			}
		}
	}

	private getRemainingMonster(): Cell[] {
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

	/*===============*/
	/*===DEBUGGING===*/
	/*===============*/

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

	private writeValues(openCells: boolean) {
		if (openCells === true) {
			this.cells.forEach((row) => {
				row.forEach((cell) => {
					if (cell.type) {
						cell.HTMLElement.innerText = cell.translateType(cell.type);
					}
				});
			});
		}
	}
}
