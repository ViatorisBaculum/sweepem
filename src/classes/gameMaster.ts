import { PC_Assassin } from "./PlayerClasses/PC_Assassin";
import { PC_Mage } from "./PlayerClasses/PC_Mage";
import { PC_Paladin } from "./PlayerClasses/PC_Paladin";
import { PC_Warrior } from "./PlayerClasses/PC_Warrior";
import { Board } from "./board";
import { Player } from "./player";
import defaults from "../util/defaults";
import { playerClasses } from "../util/customTypes";

export class GameMaster {
	private static instance: GameMaster;
	private _board?: Board;
	private _player?: Player;
	private _width: number = defaults.boardDefaults.width;
	private _height: number = defaults.boardDefaults.height;
	private _minesFrequency: number = defaults.boardDefaults.minesFrequency;
	private _playerClass: playerClasses = defaults.playerClass;
	private _timer?: NodeJS.Timeout;
	private _gameTimer: number = 0;

	private constructor() {
		document.getElementById("resetButton")?.addEventListener("click", () => this.resetGame());
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
	/*==============*/
	/*public methods*/
	/*==============*/
	public createBoard() {
		this.board = new Board(this._width, this._height, this._minesFrequency);
	}

	public createPlayer() {
		switch (this._playerClass) {
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

	public loseGame() {
		this.endGame();
	}

	public playerUp() {
		this.board.indicateLevelGain();
		this.board.evoluteMonster();
	}

	public resetGame() {
		const boardHTML = document.getElementById("app");
		if (boardHTML) boardHTML.innerHTML = "";

		this.startGame();
	}

	public setSettings() {
		this._width = +this.getValueFromInput("inputWidth");
		this._height = +this.getValueFromInput("inputHeight");
		this._minesFrequency = +this.getValueFromInput("inputMinesFrequency");
		this._playerClass = this.getValueFromInput("selectClass") as playerClasses;
	}

	public startGame() {
		this.setSettings();
		this.createBoard();
		this.createPlayer();
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

	private resetTimer() {
		this.stopTimer();
		this._gameTimer = 0;
	}

	private stopTimer() {
		clearInterval(this._timer);
	}
}
