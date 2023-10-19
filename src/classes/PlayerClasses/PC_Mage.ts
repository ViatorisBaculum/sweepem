import { Player } from "../player";

export class PC_Mage extends Player {
	className = "Mage";

	constructor() {
		super();
		this.health = 3;
	}
}
