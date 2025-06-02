import { Player } from "../player";
import { Board } from "../board";
import { CellType } from "../../util/customTypes";
import { resetFireballButton } from "../../content";

export class PC_Mage extends Player {
	className = "Mage";
	private fireballAvailable = true;
	public isFireballModeActive: boolean = false;
	private board: Board;

	constructor(board: Board | undefined) {
		super();
		if (!board) {
			throw new Error("PC_Mage requires a Board instance during construction.");
		}
		this.health = 2;
		this.maxHealth = this.health;
		this.board = board;
	}

	public canCastFireball(): boolean {
		return this.fireballAvailable;
	}

	private consumeFireballCharge(): void {
		this.fireballAvailable = false;
	}

	public resetFireball(): void {
		this.fireballAvailable = true;
		resetFireballButton();
	}

	public activateFireballMode(): boolean {
		if (!this.canCastFireball()) {
			return false;
		}
		this.isFireballModeActive = true;
		document.body.classList.add("fireball-mode-active");
		resetFireballButton();
		return true;
	}

	public deactivateFireballMode(): void {
		this.isFireballModeActive = false;
		document.body.classList.remove("fireball-mode-active");
		resetFireballButton();
	}

	public castFireballOnCell(x: number, y: number): void {
		if (!this.isFireballModeActive) {
			return;
		}

		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				const cell = this.board.getCell(x + dx, y + dy);
				if (cell && !cell.isClicked && cell.type === CellType.Empty) {
					cell.click(0);
				}
			}
		}

		this.consumeFireballCharge();
		this.deactivateFireballMode();
	}
}