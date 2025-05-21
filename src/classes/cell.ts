import { Board } from "./board";
import { GameMaster } from "./gameMaster";
import { CellType } from "../util/customTypes";
import defaults from "../util/defaults";

export class Cell {
	type: CellType;
	value?: number;
	isClicked: boolean = false;
	isFlagged: boolean = false;
	board: Board;
	HTMLElement: HTMLButtonElement;
	x: number;
	y: number;
	gameInstance = GameMaster.getInstance();

	constructor(type: CellType, board: Board, x: number, y: number, htmlElement: HTMLButtonElement, value?: number) {
		this.type = type;
		this.board = board;
		this.value = value;
		this.x = x;
		this.y = y;
		this.HTMLElement = htmlElement;
		this.addEventListeners();

		if (this.gameInstance.player.className === "Assassin") this.rightClick = this.rightClickAssassin;
	}

	/*==============*/
	/*public methods*/
	/*==============*/

	activateCell(experience: number) {
		this.revealCell();
		this.addExperience(experience);
	}

	addExperience(experience: number) {
		this.gameInstance.player.gainExperience(experience);
	}

	attackPlayer(damage?: number) {
		if (!damage && damage !== 0) damage = this.type - this.gameInstance.player.level + 1;

		if (damage > 0) {
			this.gameInstance.player.getAttacked(damage);
		}

		this.addExperience(this.type * defaults.experienceGain.multiplicator);

		if (this.gameInstance.player.health > 0 && this.type === CellType.Boss) this.gameInstance.winGame();
	}

	click() {
		if (this.value !== undefined) {
			this.activateCell(defaults.experienceGain.open);
		}

		if (this.value === 0 && this.type === CellType.Empty) {
			this.clickNeighbors();
		}

		if (this.type > 0 && this.value === undefined) {
			this.attackPlayer();
			this.activateCell(0);
		}
	}

	public getBlankNeighbors() {
		let neighbors: Cell[] = [];
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				const cell = this.board.getCell(this.x + dx, this.y + dy);
				if (cell && cell.value === 0) {
					neighbors.push(cell);
				}
			}
		}
		return neighbors;
	}

	clickNeighbors() {
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				const neighbor = this.board.getCell(this.x + dx, this.y + dy);
				if (neighbor && !neighbor.isClicked && !neighbor.isFlagged) {
					if (neighbor.value === 0) {
						neighbor.click();
					} else if (neighbor.type === CellType.Empty) {
						neighbor.activateCell(defaults.experienceGain.open);
					} else if (neighbor.type > CellType.Empty) {
						neighbor.click();
					}
				}
			}
		}
	}

	public isAnyNeighborClicked(): boolean {
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				const neighbor = this.board.getCell(this.x + dx, this.y + dy);
				if (neighbor && neighbor.isClicked) return true;
			}
		}
		return false;
	}

	removeEventListeners() {
		this.HTMLElement.addEventListener("click", (e) => e.stopImmediatePropagation(), true);
		this.HTMLElement.addEventListener("contextmenu", (e) => {
			e.stopImmediatePropagation();
			e.preventDefault();
		},
			true
		);
	}

	revealCell() {
		this.isClicked = true;
		this.animateReveal();

		this.HTMLElement.classList.add("clicked");

		if (this.value) this.HTMLElement.innerText = this.value.toString();
		else if (!this.value && this.type > 0) {
			this.HTMLElement.innerText = this.translateType(this.type);
			this.HTMLElement.classList.add("monster", this.translateType(this.type));
		} else this.HTMLElement.innerText = "";
	}

	rightClick(e: Event) {
		e.preventDefault();
		if (!this.isClicked) {
			this.isFlagged = !this.isFlagged;
			this.toggleFlag();
		} else {
			this.clickNeighbors();
		}
	}

	rightClickAssassin(e: Event) {
		e.preventDefault();
		if (!this.isClicked) {
			this.activateCell(0);
			if (this.gameInstance.player.level === this.type) {
				this.attackPlayer(0);
			} else if (this.gameInstance.player.level < this.type) {
				this.attackPlayer();
			} else {
				this.attackPlayer(1);
			}
		} else {
			this.clickNeighbors();
		}
	}

	public translateType(type: CellType): string {
		if (type > 0 && defaults.monsterKeys[type] !== undefined) {
			return defaults.monsterKeys[type];
		}
		if (type === CellType.Empty) {
			return "."; // or "" or any symbol for empty
		}
		return "?";
	}

	/*===============*/
	/*private methods*/
	/*===============*/

	private addEventListeners() {
		if (this.gameInstance.invertClicks) {
			this.HTMLElement.addEventListener("click", (e) => this.rightClick(e), false);
			this.HTMLElement.addEventListener("contextmenu", () => this.click(), false);
		} else {
			this.HTMLElement.addEventListener("click", () => this.click(), false);
			this.HTMLElement.addEventListener("contextmenu", (e) => this.rightClick(e), false);
		}
	}

	public toggleFlag(): void {
		if (this.isFlagged) {
			this.HTMLElement.innerHTML = "F";
			this.HTMLElement.classList.add("flagged");
		} else {
			this.HTMLElement.innerHTML = "";
			this.HTMLElement.classList.remove("flagged");
		}
	}

	private animateReveal() {
		if (this.HTMLElement.checkVisibility()) {
			this.HTMLElement.classList.remove("shrinked");

			this.HTMLElement.classList.add("shrinked");
		}
	}

	// private isMobile(): boolean {
	// 	var hasTouchScreen = false;

	// 	if ("maxTouchPoints" in navigator) {
	// 		hasTouchScreen = navigator.maxTouchPoints > 0;
	// 	}

	// 	if (hasTouchScreen) {
	// 		return true;
	// 	} else return false
	// }
}