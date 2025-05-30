import { typeDistribution, CellType } from "../util/customTypes";
import defaults from "../util/defaults";
import { Cell } from "./cell";

export class Board {
	cells: Cell[][] = [];

	private _minesFrequency: number;
	private _width: number;
	private _height: number;
	private appElement: HTMLElement;

	private clickHandler: (e: MouseEvent) => void;
	private contextMenuHandler: (e: MouseEvent) => void;

	constructor(width: number, height: number, minesFreq: number, distribution: typeDistribution = defaults.typeDistribution) {
		this.validateDistribution(distribution);

		this._minesFrequency = minesFreq;
		this._width = width;
		this._height = height;

		const app = document.getElementById("app");
		if (!app) throw new Error("board: No #app div found");
		this.appElement = app;

		this.fillBoard(distribution);

		this.determineCellValues();
		this.debug_printCellValues();
		this.updateCSSVariables(width, height);

		this.debug_writeValues(false);
		this.clickHandler = this.createClickHandler();
		this.contextMenuHandler = this.createContextMenuHandler();
		this.addBoardEventHandlers();
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
		this.debug_printCellValues();
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

	public indicateLevelGain(level: number) {
		if (this.appElement) {
			this.appElement.classList.remove("highlight");
			void this.appElement.offsetWidth;
			this.appElement.classList.add("highlight");
			this.appElement.style.setProperty("--button-color", defaults.boardColors[(level as keyof typeof defaults.boardColors)]);
		}
	}

	public openStartArea() {
		let x = Math.floor(Math.random() * (this._height - 1));
		let y = Math.floor(Math.random() * (this._width - 1));
		let startCell = this.cells[x][y];
		while (startCell.value !== 0) {
			x = Math.round(Math.random() * (this._height - 1));
			y = Math.round(Math.random() * (this._width - 1));
			startCell = this.cells[x][y];
		}
		startCell.click();
		startCell.HTMLElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
	}

	public removeEventHandler() {
		this.appElement.removeEventListener("click", this.clickHandler);
		this.appElement.removeEventListener("contextmenu", this.contextMenuHandler);
	}

	public removeAllFlags() {
		this.cells.flat().forEach(cell => {
			if (cell.isFlagged) {
				cell.isFlagged = false;
				cell.toggleFlag();
			}
		});
	}

	public revealBoard() {
		this.cells.flat().forEach(cell => {
			if (!cell.isClicked) {
				cell.HTMLElement.classList.add("notClicked");
				cell.revealCell();
				if (cell.isFlagged) cell.isFlagged = false;
			}
		});
	}

	/*===============*/
	/*private methods*/
	/*===============*/

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

		// Fisher–Yates Shuffle
		for (let i = urn.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[urn[i], urn[j]] = [urn[j], urn[i]];
		}

		return urn;
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
		const fragment = document.createDocumentFragment();

		for (let i = 0; i < this._height; i++) {
			this.cells.push([]);
			for (let j = 0; j < this._width; j++) {
				const HTMLElement = document.createElement("button");
				HTMLElement.dataset.x = i.toString();
				HTMLElement.dataset.y = j.toString();
				const cell = new Cell(urn.pop() ?? CellType.Empty, this, i, j, HTMLElement);
				fragment.appendChild(HTMLElement);
				this.cells[i].push(cell);
			}
		}
		this.appElement.appendChild(fragment); // Only one DOM update!
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

	/**
	 * Updates the CSS variables for grid columns and rows.
	 * @param gridCols - The number of columns in the grid.
	 * @param gridRows - The number of rows in the grid.
	 */
	private updateCSSVariables(gridCols: number, gridRows: number) {
		const root = document.querySelector(":root") as HTMLElement;
		if (!root) throw new Error("No :root found");
		root.style.setProperty("--cols", gridCols.toString());
		root.style.setProperty("--rows", gridRows.toString());
	}

	private validateDistribution(distribution: typeDistribution): true {
		let proportionSum = 0;
		for (const [_key, value] of Object.entries(distribution)) proportionSum += value;
		if (Math.abs(proportionSum - 1) < 1e-6) return true;
		else throw new Error("Provided typeDistribution doesn't sum to 1. Sum of proportions is " + proportionSum);
	}

	private createClickHandler() {
		return (e: MouseEvent) => {
			const target = e.target as HTMLButtonElement;
			if (!target || !target.dataset.x || !target.dataset.y) return;
			const x = Number(target.dataset.x);
			const y = Number(target.dataset.y);
			const cell = this.getCell(x, y);
			if (!cell) return;

			if (cell.gameInstance.invertClicks) {
				cell.rightClick(e);
			} else {
				cell.click();
			}
		};
	}

	private createContextMenuHandler() {
		return (e: MouseEvent) => {
			const target = e.target as HTMLButtonElement;
			if (!target || !target.dataset.x || !target.dataset.y) return;
			e.preventDefault();
			const x = Number(target.dataset.x);
			const y = Number(target.dataset.y);
			const cell = this.getCell(x, y);
			if (!cell) return;

			if (cell.gameInstance.invertClicks) {
				cell.click();
			} else {
				cell.rightClick(e);
			}
		};
	}

	private addBoardEventHandlers() {
		this.appElement.addEventListener("click", this.clickHandler);
		this.appElement.addEventListener("contextmenu", this.contextMenuHandler);
	}

	/*===============*/
	/*===DEBUGGING===*/
	/*===============*/

	private debug_printCellValues(): void {
		const table: (string | number)[][] = [];
		this.cells.forEach((row) => {
			const line: (string | number)[] = [];
			row.forEach((cell) => {
				if (cell.type === CellType.Empty) {
					line.push((cell.value !== undefined ? cell.value.toString() : " ").padStart(2, " "));
				} else {
					line.push(cell.translateType(cell.type).padStart(2, " "));
				}
			});
			table.push(line);
		});
		console.table(table);
	}

	private debug_writeValues(openCells: boolean) {
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
