import { Player } from "../player";
import { Board } from "../board";

export class PC_Assassin extends Player {
	className = "Assassin";

	constructor(_board?: Board) {
		super();
		this.health = 2;
		this.maxHealth = this.health;
	}
}
