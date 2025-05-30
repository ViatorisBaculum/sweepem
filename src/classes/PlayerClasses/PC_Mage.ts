import { Player } from "../player";

export class PC_Mage extends Player {
	className = "Mage";
	private fireballAvailable = true;

	constructor() {
		super();
		this.health = 2;
		this.maxHealth = this.health;
	}

	public canCastFireball(): boolean {
		return this.fireballAvailable;
	}

	public useFireball(): void {
		this.fireballAvailable = false;
	}

	public resetFireball(): void {
		this.fireballAvailable = true;
	}
}