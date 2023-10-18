export enum PlayerClass { Warrior, Paladin, Mage, Assassin }

export class Player {
	playerClass: PlayerClass;
	health: number;
	experience: number;
	level: number;

	constructor(playerClass: PlayerClass) {
		this.playerClass = playerClass;
		this.experience = 0;
		this.level = 1;
		this.health = 0;
		switch (playerClass) {
			case PlayerClass.Warrior:
				this.health = 5;
				break;
			case PlayerClass.Paladin:
				this.health = 4;
				break;
			case PlayerClass.Mage:
				this.health = 3;
				break;
			case PlayerClass.Assassin:
				this.health = 2;
				break;
			default:
				throw new Error("Class not defined!");
				break;
		}

		this.updateStatsheet();
	}

	updateStatsheet() {
		//const statSheet = document.getElementById("statSheet");

		const classText = document.getElementById("playerClass");
		if (classText) {
			classText.innerText = "Class " + this.playerClass.toString();
		}
		const level = document.getElementById("playerLevel");
		if (level) {
			level.innerText = "Level " + this.level.toString();
		}
		const health = document.getElementById("health");
		if (health) {
			health.innerText = "Health " + this.health.toString();
		}
		const experience = document.getElementById("experience");
		if (experience) {
			experience.innerText = "Experience " + this.experience.toString();
		}
	}
}