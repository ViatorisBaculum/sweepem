import { Player } from "../player";
import { Board } from "../board";

export class PC_Warrior extends Player {
	className = "Warrior";

	constructor(_board?: Board) {
		super();
		this.health = 3;
		this.maxHealth = this.health;
	}
}
