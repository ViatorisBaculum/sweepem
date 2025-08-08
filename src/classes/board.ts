import { typeDistribution, CellType } from "../util/customTypes";
import defaults from "../util/defaults";
import { Cell } from "./cell";
import { GameMaster } from "./gameMaster";
import { BoardMemento } from "./saveManager";

export class Board {
	cells: Cell[][] = [];

	private _minesFrequency: number;
	private _width: number;
	private _height: number;
	private appElement: HTMLElement;
	private gameInstance: GameMaster;

	private clickHandler: (e: MouseEvent) => void;
	private contextMenuHandler: (e: MouseEvent) => void;

	constructor(width: number, height: number, minesFreq: number, gameMaster: GameMaster, distribution: typeDistribution = defaults.typeDistribution) {
		this.validateDistribution(distribution);
		this.gameInstance = gameMaster;

		this._minesFrequency = minesFreq;
		this._width = width;
		this._height = height;

		const app = document.getElementById("app");
		if (!app) throw new Error("board: No #app div found");
		this.appElement = app;

		this.fillBoard(distribution);

		this.determineCellValues();
		this.updateCSSVariables(width, height);

		this.clickHandler = this.createClickHandler();
		this.contextMenuHandler = this.createContextMenuHandler();
		this.addBoardEventHandlers();
		this.indicateLevelGain(1);
	}

	/*==============*/
	/*public methods*/
	/*==============*/

	public createMemento(): BoardMemento {
		const cellMementos = this.cells.map((row) =>
			row.map((cell) => cell.createMemento())
		);
		return { cells: cellMementos };
	}

	public restoreFromMemento(memento: BoardMemento): void {
		for (let i = 0; i < this._height; i++) {
			for (let j = 0; j < this._width; j++) {
				this.cells[i][j].restoreFromMemento(memento.cells[i][j]);
			}
		}
	}

	public redraw(): void {
		this.cells.flat().forEach((cell) => cell.updateVisuals());
	}

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
			// reset existing level classes
			for (let i = 1; i <= 5; i++) {
				this.appElement.classList.remove(`level-${i}`);
			}
			this.appElement.classList.add(`level-${level}`);

			this.appElement.classList.remove("highlight");
			void this.appElement.offsetWidth;
			this.appElement.classList.add("highlight");
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

		requestAnimationFrame(() => {
			startCell.HTMLElement.focus();
			startCell.HTMLElement.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "center"
			});
		});
	}

	public removeEventHandler() {
		this.appElement.removeEventListener("click", this.clickHandler);
		this.appElement.removeEventListener("contextmenu", this.contextMenuHandler);
	}

	public removeAllFlags() {
		this.cells.flat().forEach((cell: Cell) => {
			if (cell.isFlagged) {
				cell.isFlagged = false;
				cell.updateVisuals();
			}
		});
	}

	public revealBoard(instant = false) {
		this.cells.flat().forEach((cell: Cell) => {
			if (!cell.isClicked) {
				cell.HTMLElement.classList.add("notClicked");
				cell.revealCell(instant);
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
				const cell = new Cell(
					urn.pop() ?? CellType.Empty,
					this,
					i,
					j,
					HTMLElement,
					this.gameInstance,
					undefined
				);
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
			const target = e.target as HTMLElement;
			if (!target.dataset.x || !target.dataset.y) return;
			const clickedCell = this.cells[Number(target.dataset.x)][Number(target.dataset.y)];

			if (e.button === 0) {
				// Normal left click
				if (this.gameInstance.invertClicks) {
					this.gameInstance.player.onSecondaryAction(clickedCell, e);
				} else {
					this.gameInstance.player.onPrimaryAction(clickedCell);
				}
			}
		};
	}

	private createContextMenuHandler() {
		return (e: MouseEvent) => {
			e.preventDefault();
			const target = e.target as HTMLElement;
			if (!target.dataset.x || !target.dataset.y) return;
			const clickedCell = this.cells[Number(target.dataset.x)][Number(target.dataset.y)];

			if (this.gameInstance.invertClicks) {
				this.gameInstance.player.onPrimaryAction(clickedCell);
			} else {
				this.gameInstance.player.onSecondaryAction(clickedCell, e);
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
		let result = "";

		// Add column indices
		result += "    "; // space for row indices
		for (let col = 0; col < this._width; col++) {
			result += col.toString().padStart(3, " ");
		}
		result += "\n";

		this.cells.forEach((row, rowIdx) => {
			// Add row index
			let line = rowIdx.toString().padStart(3, " ") + " ";
			row.forEach((cell) => {
				let val = cell.type === CellType.Empty
					? (cell.value !== undefined ? cell.value.toString() : ".")
					: cell.translateType(cell.type);
				line += val.toString().padStart(3, " ");
			});
			result += line + "\n";
		});
		console.log(result);
	}

	debug_writeValues(openCells: boolean) {
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

	/**
	 * Initializes the debug UI.
	 * Toggles the visibility of the debug button based on localStorage setting.
	 * Writes cell values to the console and updates the UI if debug mode is active.
	 * This method is called during the Board's construction.
	 */
	setupDebugUI() {
		this.setupDebugToggle(this); // Setup the toggle for debug mode
		const debugActive = localStorage.getItem("showDebug") === "true";
		const debugBtn = document.getElementById("debugLevelUp") as HTMLButtonElement | null;
		if (debugBtn) debugBtn.style.display = debugActive ? "" : "none";
		this.debug_writeValues(debugActive);
		this.debug_printCellValues();
	}

	setupDebugToggle(boardInstance: Board) {
		const debugSwitch = document.getElementById("showDebug") as HTMLInputElement | null;
		const debugBtn = document.getElementById("debugLevelUp") as HTMLButtonElement | null;

		if (!debugSwitch || !debugBtn) return;

		// Initialer Zustand aus localStorage laden (optional)
		const debugActive = localStorage.getItem("showDebug") === "true";
		debugSwitch.checked = debugActive;
		debugBtn.style.display = debugActive ? "" : "none";
		boardInstance.debug_writeValues(debugActive);

		debugSwitch.addEventListener("change", () => {
			const show = debugSwitch.checked;
			debugBtn.style.display = show ? "" : "none";
			boardInstance.debug_writeValues(show);
			localStorage.setItem("showDebug", show ? "true" : "false");
		});
	}
}
