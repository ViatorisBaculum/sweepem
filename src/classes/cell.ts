import { Board } from "./board";

export enum CellType { Empty, Bat, Zombie, Skeleton, Ghost, Boss };

export class Cell {
	type: CellType;
	value?: number;
	isClicked: boolean = false;
	isFlagged: boolean = false;
	board: Board;
	HTMLElement: HTMLButtonElement;
	x: number;
	y: number;

	constructor(type: CellType, board: Board, x: number, y: number, htmlElement: HTMLButtonElement, value?: number) {
		this.type = type;
		this.board = board;
		this.value = value;
		this.x = x;
		this.y = y;
		this.HTMLElement = htmlElement;
		this.addEventListeners();
	}

	click() {
		if (this.value !== undefined) {
			this.revealCell();
		}

		if (this.value === 0 && this.type === CellType.Empty) {
			this.clickNeighbors();
		}

		if (this.type > 0 && this.value === undefined) {
			// get attacked
			// when not killed reveal cell
			this.revealCell();
		}
	}

	clickNeighbors() {
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				const neighbor = this.board.getCell(this.x + dx, this.y + dy);
				if (neighbor) {
					if (neighbor.value === 0 && !neighbor.isClicked) {
						neighbor.click();
					} else if (neighbor.type === CellType.Empty && !neighbor.isClicked) {
						neighbor.revealCell();
					} else if (neighbor.type > CellType.Empty && !neighbor.isClicked) {
						neighbor.click();
					}
				}
			}
		}
	}

	revealCell() {
		this.isClicked = true;

		this.HTMLElement.disabled = true;
		this.HTMLElement.classList.add("clicked");

		if (this.value) this.HTMLElement.innerText = this.value.toString();
		else if (!this.value && this.type > 0) {
			this.HTMLElement.innerText = this.translateType(this.type);
			this.HTMLElement.classList.add("monster");
		}
		else this.HTMLElement.innerText = "";
	}

	private translateType(type: number): string {
		if (type < 1 || type > 5) {

		}
		switch (type) {
			case 1:
				return "B";
				break;

			default:
				return "x"; // Wenn alle Gegner definiert sind, kann das weg
				break;
		}
	}

	private rightClick(e: Event) {
		e.preventDefault();
		if (!this.isClicked) {
			this.isFlagged = !this.isFlagged;
			this.toggleFlag();
		} else {
			this.clickNeighbors();
		}
	}

	private addEventListeners() {
		this.HTMLElement.addEventListener("click", () => this.click());
		this.HTMLElement.addEventListener("contextmenu", (event) =>
			this.rightClick(event)
		);
	}

	private toggleFlag(): void {
		if (this.isFlagged) this.HTMLElement.innerHTML = "F";
		else this.HTMLElement.innerHTML = "";
	}
}