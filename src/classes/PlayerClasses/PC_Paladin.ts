import { Player } from "../player";

export class PC_Paladin extends Player {
	className = "Paladin";

	constructor() {
		super();
		this.health = 4;
		this.maxHealth = this.health;
	}
}
