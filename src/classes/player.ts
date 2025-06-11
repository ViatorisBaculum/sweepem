import { CellType } from "../util/customTypes";
import defaults from "../util/defaults";
import { GameMaster } from "./gameMaster";
import { PlayerMemento } from "./saveManager";
import { Cell } from "./cell";

export interface SpecialAbility {
	isReady: boolean;
	isWaiting: boolean;
}

interface PlayerHTMLHooks {
	playerClassSpan: HTMLElement;
	playerExperienceProgress: HTMLProgressElement;
	playerHealthDiv: HTMLElement;
	playerLevelDiv: HTMLElement;
	playerScoreDiv: HTMLElement;
}
export abstract class Player {
	abstract className: string;
	abstract description: string;
	private _experience: number = 0;
	private _health: number = 0;
	protected maxHealth: number = 0;
	private _level: number = 1;
	private _score: number = 0;
	private _HTMLHooks: PlayerHTMLHooks;
	private heartContainers: HTMLImageElement[] = [];

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
		if (this._health <= 0) GameMaster.getInstance().loseGame();
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

	protected set score(score: number) {
		this._score = score;
		this.updateStatsheet();
	}
	public get score(): number {
		return this._score;
	}
	/*==============*/
	/*public methods*/
	/*==============*/
	public onPrimaryAction(cell: Cell): void {
		cell.click();
	}

	public onSecondaryAction(cell: Cell, e: MouseEvent): void {
		cell.rightClick(e);
	}

	calculateScore(time: number): void {
		this.score = this.experience - time;
		if (this.score < 0) this.score = 0;
	}

	calculateDamage(cell: Cell): number {
		if (cell.type === CellType.Boss && this.level >= 5) {
			return 0;
		}
		return cell.type - this.level + 1;
	}

	getAttacked(damage: number): void {
		this.health -= damage;
	}

	gainExperience(exp: CellType): void {
		this.experience += exp;
		console.log("exp", this.experience); // Debugging line, can be removed later
	}

	debugSetExperience(exp: number): void {
		if (exp < 0) throw new Error("Experience cannot be negative");
		this.experience = exp;
	}

	debugGainLevel(): void {
		if (this.level < 5) {
			this.experience = defaults.expToNextLevel[this.level - 1];
		}
	}

	public createMemento(): PlayerMemento {
		const memento: PlayerMemento = {
			className: this.className,
			experience: this.experience,
			health: this.health,
			maxHealth: this.maxHealth,
			level: this.level,
			score: this.score,
		};
		return memento;
	}

	public restoreFromMemento(memento: PlayerMemento): void {
		this._experience = memento.experience;
		this.maxHealth = memento.maxHealth;
		this._health = memento.health;
		this._level = memento.level;
		this._score = memento.score;

		this.updateStatsheet();
	}

	public getSpecialAbility(): SpecialAbility | null {
		return null;
	}

	public useSpecialAbility(): void {
		// Base implementation does nothing
	}

	/*===============*/
	/*private methods*/
	/*===============*/

	private gainLevel(): void {
		if (this._level < 5 && this.experience >= defaults.expToNextLevel[this.level - 1]) {
			this.level += 1;
			GameMaster.getInstance().playerUp();
			this.onLevelUp();
		}
	}

	public onLevelUp(): void {
		// This is a hook for subclasses to add specific behavior on level up.
		// For example, the Warrior class can override this to gain health.
	}

	// When the Warrior gains a level, he gains a heart
	protected gainHealth(): void {
		if (this.health < this.maxHealth) {
			this.health += 1;
			this.styleHearts();
		}
	}

	private importHTMLElement(id: string): HTMLElement {
		const result = document.getElementById(id);
		if (!result) throw new Error("No html element with id: " + id);
		return result;
	}

	private importHTMLProgressElement(id: string): HTMLProgressElement {
		const result = document.getElementById(id) as HTMLProgressElement;
		if (!result) throw new Error("No html element with id: " + id);
		return result;
	}

	private loadHTMLHooks(): PlayerHTMLHooks {
		return {
			playerClassSpan: this.importHTMLElement("playerClass"),
			playerExperienceProgress: this.importHTMLProgressElement("experience"),
			playerHealthDiv: this.importHTMLElement("health"),
			playerLevelDiv: this.importHTMLElement("playerLevel"),
			playerScoreDiv: this.importHTMLElement("score"),
		};
	}

	public updateStatsheet(): void {
		this._HTMLHooks.playerClassSpan.innerText = this.className;
		this._HTMLHooks.playerLevelDiv.innerText = this._level.toString();
		if (this.heartContainers.length === 0) this.addHearts();
		this.styleHearts();
		this.updateProgress();
		this._HTMLHooks.playerScoreDiv.innerText = "Score: " + this._score.toString();
	}

	private addHearts(): void {
		for (let i = 0; i < this.maxHealth; i++) {
			const img = document.createElement("img");
			img.src = "./res/heart.svg";
			img.alt = "Health";
			img.classList.add("heart");
			this.heartContainers.push(img);
			this._HTMLHooks.playerHealthDiv.appendChild(img);
		}
	}

	private styleHearts() {
		this.heartContainers.forEach((heart, i) => {
			if (i >= this.health) heart.classList.add("colored");
			else heart.classList.remove("colored");
		});
	}

	private updateProgress() {
		if (this._level < 5) {
			const expFromLastLevel = this._level > 1 ? defaults.expToNextLevel[this.level - 2] : 0;
			this._HTMLHooks.playerExperienceProgress.max = defaults.expToNextLevel[this.level - 1] - expFromLastLevel;
			this._HTMLHooks.playerExperienceProgress.value = this._experience - expFromLastLevel;
		}
	}
}
