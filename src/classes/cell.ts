import { Board } from "./board";
import { GameMaster } from "./gameMaster";

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

	public click() {
		if (this.value !== undefined) {
			this.revealCell();
		}

		if (this.value === 0 && this.type === CellType.Empty) {
			this.clickNeighbors();
		}

		if (this.type > 0 && this.value === undefined) {
			this.attackPlayer();

			this.revealCell();
		}
	}

	attackPlayer() {
		const gameInstance = GameMaster.getInstance();
		const damage = this.type - gameInstance.player.level + 1;

		if (damage >= 0) {
			gameInstance.player.getAttacked(damage);
		}

		gameInstance.player.gainExperience(this.type);
	}

	clickNeighbors() {
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				const neighbor = this.board.getCell(this.x + dx, this.y + dy);
				if (neighbor && !neighbor.isClicked) {
					if (neighbor.value === 0) {
						neighbor.click();
					} else if (neighbor.type === CellType.Empty) {
						neighbor.revealCell();
					} else if (neighbor.type > CellType.Empty) {
						neighbor.click();
					}
				}
			}
		}
	}

	revealCell() {
		const gameInstance = GameMaster.getInstance();
		gameInstance.player.gainExperience(1);

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

	private translateType(type: CellType): string {
		switch (type) {
			case CellType.Bat:
				return "B";
			case CellType.Zombie:
				return "Z";
			case CellType.Skeleton:
				return "S";
			case CellType.Ghost:
				return "G";
			case CellType.Boss:
				return "Bo";
			default:
				throw new Error("Unknown CellType");
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
		this.HTMLElement.addEventListener("click", () => this.click(), false);
		this.HTMLElement.addEventListener("contextmenu", (e) => this.rightClick(e), false);
	}

	public removeEventListeners() {
		this.HTMLElement.addEventListener("click", (e) => e.stopImmediatePropagation(), true);
		this.HTMLElement.addEventListener("contextmenu", (e) => { e.stopImmediatePropagation(); e.preventDefault() }, true);
	}

	private toggleFlag(): void {
		if (this.isFlagged) this.HTMLElement.innerHTML = "F";
		else this.HTMLElement.innerHTML = "";
	}
}