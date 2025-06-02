import { Player } from "../player";
import { Board } from "../board";

export class PC_Paladin extends Player {
	className = "Paladin";

	constructor(_board?: Board) {
		super();
		this.health = 4;
		this.maxHealth = this.health;
	}
}
