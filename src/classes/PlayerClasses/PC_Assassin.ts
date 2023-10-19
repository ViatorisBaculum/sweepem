import { Player } from "../player";

export class PC_Assassin extends Player {
	className = "Assassin";

	constructor() {
		super();
		this.health = 2;
	}
}
