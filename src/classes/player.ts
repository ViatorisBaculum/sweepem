import { CellType } from "../util/customTypes";
import defaults from "../util/defaults";
import { GameMaster } from "./gameMaster";

interface PlayerHTMLHooks {
	playerClassDiv: HTMLElement;
	playerExperienceDiv: HTMLElement;
	playerHealthDiv: HTMLElement;
	playerLevelDiv: HTMLElement;
}
export abstract class Player {
	abstract className: string;
	private _experience: number = 0;
	private _health: number = 0;
	private _level: number = 1;
	private _HTMLHooks: PlayerHTMLHooks;

	constructor() {
		this._HTMLHooks = this.loadHTMLHooks();
	}
	/*=================*/
	/*getters & setters*/
	/*=================*/
	protected set experience(exp: number) {
		this._experience = exp;
		this.gainLevel();
		this.updateStatsheet();
	}
	public get experience(): number {
		return this._experience;
	}

	protected set health(health: number) {
		this._health = health;
		if (this._health <= 0) GameMaster.getInstance().endGame();
		this.updateStatsheet();
	}
	public get health(): number {
		return this._health;
	}

	protected set level(level: number) {
		this._level = level;
		this.updateStatsheet();
	}
	public get level(): number {
		return this._level;
	}
	/*==============*/
	/*public methods*/
	/*==============*/
	getAttacked(damage: number) {
		this.health -= damage;
	}
	gainExperience(exp: CellType) {
		this.experience += exp;
	}
	/*===============*/
	/*private methods*/
	/*===============*/
	private updateStatsheet() {
		this._HTMLHooks.playerClassDiv.innerText = "Class: " + this.className;
		this._HTMLHooks.playerLevelDiv.innerText =
			"Level: " + this._level.toString();
		this._HTMLHooks.playerHealthDiv.innerText =
			"Health: " + this._health.toString();
		this._HTMLHooks.playerExperienceDiv.innerText =
			"Experience: " + this._experience.toString();
	}

	private loadHTMLHooks(): PlayerHTMLHooks {
		return {
			playerClassDiv: this.importHTMLElement("playerClass"),
			playerExperienceDiv: this.importHTMLElement("experience"),
			playerHealthDiv: this.importHTMLElement("health"),
			playerLevelDiv: this.importHTMLElement("playerLevel"),
		};
	}

	private importHTMLElement(id: string): HTMLElement {
		const result = document.getElementById(id);
		if (!result) throw new Error("No html element with id: " + id);
		return result;
	}

	private gainLevel() {
		if (this.experience > defaults.expToNextLevel[this.level - 1]) {
			this.level += 1;
			GameMaster.getInstance().playerUp();
		}
	}
}
