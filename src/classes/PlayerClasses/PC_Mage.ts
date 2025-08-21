import { Player } from "../player";
import { Board } from "../board";
import { CellType } from "../../util/customTypes";
import { updateSpecialAbilityButton } from "../../content";
import { PlayerMemento } from "../saveManager";
import { Cell } from "../cell";
import { SpecialAbility } from "../player";

export class PC_Mage extends Player {
	className = "Mage";
	static description = "The mage can unleash a powerful 3x3 fireball. This ability recharges on every level up.";
	private _fireballAvailable = true;
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

	override getSpecialAbility(): SpecialAbility {
		return {
			isReady: this.canCastFireball() && !this.isFireballModeActive,
			isWaiting: this.isFireballModeActive,
		};
	}

	override useSpecialAbility(): void {
		if (this.isFireballModeActive) {
			this.deactivateFireballMode();
		} else {
			this.activateFireballMode();
		}
	}

	private onAnyAction(cell: Cell, e?: MouseEvent): void {
		if (this.isFireballModeActive) {
			this.castFireballOnCell(cell.x, cell.y);
			// Verhindern, dass die normale Aktion ausgeführt wird
			e?.preventDefault();
			e?.stopPropagation();
		}
	}

	override onPrimaryAction(cell: Cell, e?: MouseEvent): void {
		if (this.isFireballModeActive) {
			this.onAnyAction(cell, e);
		} else {
			super.onPrimaryAction(cell, e);
		}
	}

	override onSecondaryAction(cell: Cell, e: MouseEvent): void {
		if (this.isFireballModeActive) {
			this.onAnyAction(cell, e);
		} else {
			super.onSecondaryAction(cell, e);
		}
	}

	public canCastFireball(): boolean {
		return this._fireballAvailable;
	}

	private consumeFireballCharge(): void {
		this._fireballAvailable = false;
	}

	public resetFireball(): void {
		this._fireballAvailable = true;
		updateSpecialAbilityButton();
	}

	public activateFireballMode(): boolean {
		if (!this.canCastFireball()) {
			return false;
		}
		this.isFireballModeActive = true;
		document.body.classList.add("fireball-mode-active");
		updateSpecialAbilityButton();
		return true;
	}

	public deactivateFireballMode(): void {
		this.isFireballModeActive = false;
		document.body.classList.remove("fireball-mode-active");
		updateSpecialAbilityButton();
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

	public override createMemento(): PlayerMemento {
		const memento = super.createMemento();
		memento.fireballAvailable = this.canCastFireball();
		return memento;
	}

	public override restoreFromMemento(memento: PlayerMemento): void {
		super.restoreFromMemento(memento);
		if (memento.fireballAvailable !== undefined) {
			this._fireballAvailable = memento.fireballAvailable;
			if (this._fireballAvailable) {
				this.resetFireball();
			}
		}
		updateSpecialAbilityButton();
	}

	override onLevelUp(): void {
		super.onLevelUp();
		this.resetFireball();
	}
}
