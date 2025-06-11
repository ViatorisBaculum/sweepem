import { Player } from "../player";
import { Board } from "../board";

export class PC_Warrior extends Player {
	className = "Warrior";
	description = "The warrior is exceptionally sturdy. They start with more health and gain an additional heart container on every level up.";

	constructor(_board?: Board) {
		super();
		this.health = 3;
		this.maxHealth = this.health;
	}

	override onLevelUp(): void {
		this.gainHealth();
	}
}
