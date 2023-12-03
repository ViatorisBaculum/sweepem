import { PC_Assassin } from "./PlayerClasses/PC_Assassin";
import { PC_Mage } from "./PlayerClasses/PC_Mage";
import { PC_Paladin } from "./PlayerClasses/PC_Paladin";
import { PC_Warrior } from "./PlayerClasses/PC_Warrior";
import { Board } from "./board";
import { Player } from "./player";
import defaults from "../util/defaults";
import { playerClasses } from "../util/customTypes";

interface GameSettings {
	width: number;
	height: number;
	minesFrequency: number;
	playerClass: playerClasses;
	invertClicks: boolean;
	removeFlags: boolean;
}

export class GameMaster {
	private static instance: GameMaster;
	private _board?: Board;
	private _player?: Player;
	private _timer?: NodeJS.Timeout;
	private _gameTimer: number = 0;
	private _gameSettings: GameSettings;

	private constructor() {
		document.getElementById("resetButton")?.addEventListener("click", () => this.resetGame());
		this._gameSettings = this.loadDefaultSettings();
	}
	static getInstance() {
		if (!this.instance) {
			return (this.instance = new GameMaster());
		} else {
			return this.instance;
		}
	}

	/*=================*/
	/*getters & setters*/
	/*=================*/
	public set board(board: Board) {
		this._board = board;
	}
	public get board(): Board {
		if (!this._board) throw new Error("Board was not initialized!");
		return this._board;
	}

	public set player(player: Player) {
		this._player = player;
	}
	public get player(): Player {
		if (!this._player) throw new Error("Player was not initialized!");
		return this._player;
	}
	public get timer(): NodeJS.Timeout | undefined {
		if (!this._timer) return undefined;
		return this._timer;
	}
	public get invertClicks(): boolean {
		return this._gameSettings.invertClicks;
	}
	public get removeFlags(): boolean {
		return this._gameSettings.removeFlags;
	}
	/*==============*/
	/*public methods*/
	/*==============*/
	public createBoard() {
		this.board = new Board(this._gameSettings.width, this._gameSettings.height, this._gameSettings.minesFrequency);
	}

	public createPlayer() {
		switch (this._gameSettings.playerClass) {
			case "Assassin":
				this.player = new PC_Assassin();
				break;
			case "Mage":
				this.player = new PC_Mage();
				break;
			case "Paladin":
				this.player = new PC_Paladin();
				break;
			case "Warrior":
				this.player = new PC_Warrior();
				break;
		}
	}

	private loadDefaultSettings(): GameSettings {
		return {
			width: defaults.boardDefaults.width,
			height: defaults.boardDefaults.height,
			minesFrequency: defaults.boardDefaults.minesFrequency,
			playerClass: defaults.playerClass,
			invertClicks: defaults.boardDefaults.invertClicks,
			removeFlags: defaults.boardDefaults.removeFlags
		};
	}

	public loseGame() {
		this.endGame();

		alert("You lost! :(");
	}

	public playerUp() {
		this.board.indicateLevelGain();
		this.board.evoluteMonster();
		if (this._gameSettings.removeFlags) this.board.removeAllFlags();
	}

	public resetGame() {
		const boardHTML = document.getElementById("app");
		if (boardHTML) boardHTML.innerHTML = "";

		this.resetHeartContainer();
		this.startGame();
	}

	public setSettings() {
		this._gameSettings.width = +this.getValueFromInput("inputWidth");
		this._gameSettings.height = +this.getValueFromInput("inputHeight");
		this._gameSettings.minesFrequency = +this.getValueFromInput("minesFrequency");
		this._gameSettings.playerClass = this.getValueFromInput("selectClass") as playerClasses;
		this._gameSettings.invertClicks = (document.getElementById("invertClicks") as HTMLInputElement).checked;
		this._gameSettings.removeFlags = (document.getElementById("removeFlags") as HTMLInputElement).checked;

		localStorage.setItem("instance", JSON.stringify(this._gameSettings));
	}

	public getSettings() {
		const localSettings = localStorage.getItem("instance");
		if (localSettings !== null) {
			const storedSettings = JSON.parse(localSettings);

			this.setValueToInput("inputWidth", storedSettings.width);
			this.setValueToInput("inputHeight", storedSettings.height);
			this.setValueToInput("minesFrequency", storedSettings.minesFrequency);
			this.setValueToInput("selectClass", storedSettings.playerClass);
			this.setValueToToggle("invertClicks", storedSettings.invertClicks);
			this.setValueToToggle("removeFlags", storedSettings.removeFlags);
		}
	}

	public startGame() {
		if (document.getElementById("modal")) this.setSettings();
		this.createPlayer();
		this.createBoard();
		this._board?.openStartArea();

		this.resetTimer();
		this._timer = setInterval(() => this.countSeconds(), 1000);
	}

	public winGame() {
		this.endGame();

		alert("You won!");
	}
	/*===============*/
	/*private methods*/
	/*===============*/

	private countSeconds() {
		this._gameTimer++;
		this.player.calculateScore(this._gameTimer);
	}

	private endGame() {
		this.stopTimer();

		this.board.revealBoard();
		this.board.removeEventHandler();
	}

	private getValueFromInput(name: string) {
		const input = document.getElementById(name);
		if (input) return (input as HTMLInputElement).value;
		else throw new Error("gameMaster: getValueFromHTML: HTML does not exist");
	}

	private setValueToInput(name: string, value: string) {
		const input = document.getElementById(name);
		if (input) (input as HTMLInputElement).value = value;
		else throw new Error("gameMaster: getValueFromHTML: HTML does not exist");
	}

	private setValueToToggle(name: string, value: boolean) {
		const input = document.getElementById(name);
		if (input) (input as HTMLInputElement).checked = value;
		else throw new Error("gameMaster: getValueFromHTML: HTML does not exist");
	}

	private resetTimer() {
		this.stopTimer();
		this._gameTimer = 0;
	}

	private resetHeartContainer() {
		const hearts = document.getElementById("health");
		if (hearts) hearts.innerHTML = "";
	}

	private stopTimer() {
		clearInterval(this._timer);
	}
}
