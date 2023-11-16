import { Player } from "../player";
export class PC_Assassin extends Player {
	className = "Assassin";

	constructor() {
		super();
		this.health = 2;
		this.maxHealth = this.health;
	}

	getAttacked(damage: number): void {
		if (damage === 1) damage = 0;
		this.health -= damage;
	}
}
