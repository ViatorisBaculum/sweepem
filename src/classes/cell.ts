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
	gameInstance: GameMaster;

	constructor(
		type: CellType,
		board: Board,
		x: number,
		y: number,
		htmlElement: HTMLButtonElement,
		gameMaster: GameMaster,
		value?: number,
	) {
		this.type = type;
		this.board = board;
		this.x = x;
		this.y = y;
		this.HTMLElement = htmlElement;
		this.gameInstance = gameMaster;
		this.value = value;
	}

	/*==============*/
	/*public methods*/
	/*==============*/

	/** Activates the cell, revealing it and adding experience.
	 * @param experience - The amount of experience to add.	
	 * If not provided, defaults to the value defined in defaults.experienceGain.open.
	 */
	activateCell(experience: number) {
		this.revealCell();
		this.addExperience(experience);
	}

	/** Adds experience to the player.
	 * @param experience - The amount of experience to add.
	 */
	addExperience(experience: number) {
		this.gameInstance.player.gainExperience(experience);
	}

	/** Attacks the player, dealing damage based on the cell type.
	 * @param damage - The amount of damage to deal. If not provided, defaults to the cell type minus player level plus one.
	 */
	attackPlayer(damage?: number) {
		if (this.type === CellType.Empty) return;
		console.log("Monster attack! Type:", this.type, "at", this.x, this.y);

		if (this.gameInstance.player.className === "Assassin" && this.type === CellType.Boss && damage === undefined) {
			// Assassin wins, no damage taken
			damage = 1;
		}

		if (!damage && damage !== 0) damage = this.type - this.gameInstance.player.level + 1;

		if (damage > 0) {
			this.gameInstance.player.getAttacked(damage);
		}

		this.addExperience(this.type * defaults.experienceGain.multiplicator);

		if (this.gameInstance.player.health > 0 && this.type === CellType.Boss) this.gameInstance.winGame();
	}

	click(damage?: number) {
		if (this.isClicked || this.isFlagged) return;

		if (this.value !== undefined) {
			this.activateCell(defaults.experienceGain.open);
		}

		if (this.value === 0 && this.type === CellType.Empty) {
			this.clickNeighbors(damage);
		}

		if (this.type > 0 && this.value === undefined) {
			this.attackPlayer(damage);
			this.activateCell(0);
		}
	}

	public getBlankNeighbors() {
		let neighbors: Cell[] = [];
		const { x, y, board } = this;
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				const cell = board.getCell(x + dx, y + dy);
				if (cell && cell.value === 0) {
					neighbors.push(cell);
				}
			}
		}
		return neighbors;
	}

	private static delay(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	public async clickNeighbors(damage?: number) {
		const { x, y, board } = this;

		const neighbors: Cell[] = [];
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				const neighbor = board.getCell(x + dx, y + dy);
				if (neighbor && !neighbor.isClicked && !neighbor.isFlagged) {
					neighbors.push(neighbor);
				}
			}
		}

		for (const neighbor of neighbors) {
			if (neighbor.value === 0) {
				await Cell.delay(defaults.revealDelayPerCell);
				await neighbor.click(damage);
			} else if (neighbor.type === CellType.Empty) {
				await Cell.delay(defaults.revealDelayPerCell);
				neighbor.activateCell(defaults.experienceGain.open);
			} else if (neighbor.type > CellType.Empty) {
				await Cell.delay(defaults.revealDelayPerCell);
				neighbor.click(damage);
			}
		}
	}

	public isAnyNeighborClicked(): boolean {
		const { x, y, board } = this;
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				const neighbor = board.getCell(x + dx, y + dy);
				if (neighbor && neighbor.isClicked) return true;
			}
		}
		return false;
	}

	revealCell() {
		if (this.isClicked) return;
		this.isClicked = true;
		this.animateReveal();

		this.HTMLElement.classList.add("clicked");

		if (this.value) this.HTMLElement.innerText = this.value.toString();
		else if (!this.value && this.type > 0) {
			this.HTMLElement.innerText = this.translateType(this.type);
			// remove anything 
			const typeClass = this.translateType(this.type).replace(/[^a-zA-Z0-9_-]/g, "");
			this.HTMLElement.classList.add("monster", typeClass);
		} else this.HTMLElement.innerText = "";
	}

	rightClick(e: Event) {
		e.preventDefault();
		if (this.gameInstance.player.className === "Assassin") {
			this.rightClickAssassin(e);
			return;
		}
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
			// this.type + this.gameInstance.player.level === 11 means the player is at level 5 and the cell is a boss (type 6)
			// so the player can attack the boss without taking damage
			if (this.gameInstance.player.level === this.type || this.type + this.gameInstance.player.level === 11) {
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

	public toggleFlag(): void {
		if (this.isFlagged) {
			this.HTMLElement.innerHTML = "💀";
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
}