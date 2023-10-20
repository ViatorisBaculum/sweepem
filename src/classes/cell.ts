import { Board } from "./board";

export enum CellType { Empty, Bat, Zombie, Skeleton, Ghost, Boss };

export class Cell {
	type: CellType;
	value?: number;
	clicked: boolean = false;
	board: Board;
	HTMLElement?: HTMLButtonElement;
	x: number;
	y: number;

	constructor(type: CellType, board: Board, x: number, y: number, value?: number) {
		this.type = type;
		this.board = board;
		this.value = value;
		this.x = x;
		this.y = y;
	}

	click() {
		if (this.value !== undefined) {
			this.revealCell();
		}

		if (this.value === 0 && this.type === CellType.Empty) {
			this.clickNeighbors();
		}
	}

	clickNeighbors() {
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				const neighbor = this.board.getCell(this.x + dx, this.y + dy);
				if (neighbor) {
					if (neighbor.value === 0 && !neighbor.clicked) {
						neighbor.click();
					} else if (neighbor.type === CellType.Empty && !neighbor.clicked) {
						neighbor.revealCell();
					}
				}
			}
		}
	}

	revealCell() {
		if (!this.HTMLElement) {
			throw new Error("HTML element is not initialized");
		}

		this.clicked = true;

		this.HTMLElement.disabled = true;
		this.HTMLElement.classList.add("clicked");

		if (this.value) {
			this.HTMLElement.innerText = this.value.toString();
		}
	}

	addHTMLElement(HTMLElement: HTMLButtonElement) {
		this.HTMLElement = HTMLElement;
	}
}