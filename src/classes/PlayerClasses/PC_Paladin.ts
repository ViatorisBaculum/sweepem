import { Player } from "../player";
import { Board } from "../board";

export class PC_Paladin extends Player {
	className = "Paladin";
	description = "The paladin is blessed with immense fortitude, starting with the highest health of all classes.";

	constructor(_board?: Board) {
		super();
		this.health = 4;
		this.maxHealth = this.health;
	}
}
