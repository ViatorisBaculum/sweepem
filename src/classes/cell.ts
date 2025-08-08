import { Board } from "./board";
import { GameMaster } from "./gameMaster";
import { CellType } from "../util/customTypes";
import defaults from "../util/defaults";
import { CellMemento } from "./saveManager";

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

	public createMemento(): CellMemento {
		return {
			type: this.type,
			value: this.value,
			isClicked: this.isClicked,
			isFlagged: this.isFlagged,
		};
	}

	public restoreFromMemento(memento: CellMemento): void {
		this.type = memento.type;
		this.value = memento.value;
		this.isClicked = memento.isClicked;
		this.isFlagged = memento.isFlagged;
	}

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

		const calculatedDamage = damage ?? this.gameInstance.player.calculateDamage(this);

		if (this.gameInstance.player.level >= 5 && this.type === CellType.Boss && calculatedDamage > 0) {
			// Boss fight at level 5, player takes no damage	
			damage = 0;
		}

		if (calculatedDamage > 0) {
			this.gameInstance.player.getAttacked(calculatedDamage);
		}

		this.addExperience(this.type * defaults.experienceGain.multiplicator);

		if (this.gameInstance.player.health > 0 && this.type === CellType.Boss) this.gameInstance.winGame();

		this.animateDefeat();
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
			if (this.gameInstance.isGameEnded()) return;

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

	revealCell(instant = false) {
		if (this.isClicked) return;
		this.isClicked = true;
		this.animateReveal(instant);
		this.updateVisuals();
	}

	rightClick(e: Event) {
		e.preventDefault();
		if (!this.isClicked) {
			this.isFlagged = !this.isFlagged;
			this.updateVisuals();
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

	public updateVisuals(): void {
		if (this.isFlagged) {
			this.HTMLElement.innerHTML = "💀";
			this.HTMLElement.classList.add("flagged");
		} else {
			this.HTMLElement.innerHTML = "";
			this.HTMLElement.classList.remove("flagged");
		}

		if (this.isClicked) {
			this.HTMLElement.classList.add("clicked");
			this.HTMLElement.classList.add("shrinked");

			if (this.value) {
				this.HTMLElement.innerText = this.value.toString();
			} else if (!this.value && this.type > 0) {
				this.HTMLElement.innerText = this.type.toString();
				const typeClass = this.translateType(this.type).replace(/[^a-zA-Z0-9_-]/g, "");
				this.HTMLElement.classList.add("monster", typeClass);
			} else {
				this.HTMLElement.innerText = "";
			}
		} else {
			// If not clicked, we only care about the flag status which is handled above
			this.HTMLElement.classList.remove("clicked");
			this.HTMLElement.classList.remove("shrinked");
		}
	}

	private animateReveal(instant = false) {
		if (instant) {
			this.HTMLElement.classList.remove("shrinked", "monster-reveal-anim");
			return;
		}
		if (this.HTMLElement.checkVisibility()) {
			this.HTMLElement.classList.remove("shrinked");
			this.HTMLElement.classList.add("shrinked");
			if (this.type > 0) {
				this.HTMLElement.classList.remove("monster-reveal-anim");
				// Reflow, this forces the browser to re-calculate styles
				// This is necessary to restart the animation
				void this.HTMLElement.offsetWidth;
				this.HTMLElement.classList.add("monster-reveal-anim");
			}
		}
	}

	/*===============*/
	/*private methods*/
	/*===============*/

	private animateDefeat() {
		const cellElement = this.HTMLElement;
		const container = cellElement.parentElement;

		if (!container) return;

		const numStars = 3;
		//const cellRect = cellElement.getBoundingClientRect();
		//const containerRect = container.getBoundingClientRect();
		const cellCenterX = cellElement.offsetLeft + cellElement.offsetWidth / 2;
		const cellCenterY = cellElement.offsetTop + cellElement.offsetHeight / 2;
		const minDim = Math.min(cellElement.offsetWidth, cellElement.offsetHeight);
		const radius = minDim * 1.1; // responsive
		const starSize = minDim * 0.5; // responsive
		const delayBetweenStars = 0.08; // seconds

		// 1. Zufällige Reihenfolge
		const starOrder = Array.from({ length: numStars }, (_, i) => i).sort(() => Math.random() - 0.5);

		starOrder.forEach((starIndex, delayIndex) => {
			const star = document.createElement("img");
			star.src = "./res/star.svg";
			star.classList.add("defeat-star");

			// 2. Zufällige Skalierung und Rotation
			const scale = 0.8 + Math.random() * 0.6; // 0.8 bis 1.4
			const rotation = Math.floor(Math.random() * 360); // 0 bis 359 Grad

			// 3. Bewegung nach außen (translate)
			const angle = (starIndex / numStars) * 2 * Math.PI;
			const radiusJitter = radius * 0.15;
			const tx = Math.cos(angle) * (radius + (Math.random() - 0.5) * radiusJitter);
			const ty = Math.sin(angle) * (radius + (Math.random() - 0.5) * radiusJitter);

			star.style.setProperty("--tx", `${tx}px`);
			star.style.setProperty("--ty", `${ty}px`);
			star.style.setProperty("--s", `${scale}`);
			star.style.setProperty("--r", `${rotation}deg`);
			star.style.animationDelay = `${delayIndex * delayBetweenStars}s`;

			// 4. Responsiv positionieren (zentriert auf Zelle)
			star.style.left = `${cellCenterX - starSize / 2}px`;
			star.style.top = `${cellCenterY - starSize / 2}px`;
			star.style.width = `${starSize}px`;
			star.style.height = `${starSize}px`;

			container.appendChild(star);

			// Remove the star after the animation completes
			star.addEventListener("animationend", () => {
				star.remove();
			});
		});
	}
}