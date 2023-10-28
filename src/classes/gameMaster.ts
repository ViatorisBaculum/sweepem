import { PC_Assassin } from "./PlayerClasses/PC_Assassin";
import { PC_Mage } from "./PlayerClasses/PC_Mage";
import { PC_Paladin } from "./PlayerClasses/PC_Paladin";
import { PC_Warrior } from "./PlayerClasses/PC_Warrior";
import { Board } from "./board";
import { Player } from "./player";
import defaults from "../util/defaults"
import { playerClasses } from "../util/customTypes";

export class GameMaster {
	private static instance: GameMaster;
	private _board?: Board;
	private _player?: Player;
	private width: number = defaults.boardDefaults.width;
	private height: number = defaults.boardDefaults.height;
	private minesFrequency: number = defaults.boardDefaults.minesFrequency;
	private playerClass: playerClasses = defaults.playerClass;
	private timer?: NodeJS.Timeout;
	private gameTimer: number = 0;

	private constructor() {
		document.getElementById("resetButton")?.addEventListener("click", () => this.resetGame());
	}
	static getInstance() {
		if (!this.instance) {
			return this.instance = new GameMaster();
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

	public createBoard() {
		this.board = new Board(this.width, this.height, this.minesFrequency);
	}

	public createPlayer() {
		switch (this.playerClass) {
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

	public startGame() {
		this.setSettings();
		this.createBoard();
		this.createPlayer();

		this.timer = setInterval(() => this.countSeconds(), 1000);
	}

	countSeconds() {
		this.gameTimer++;
		this.player.calculateScore(this.gameTimer);
	}

	private endGame() {
		clearInterval(this.timer);

		this.board.revealBoard();
		this.board.removeEventHandler();
	}

	public winGame() {
		this.endGame();

		alert("You won!");
	}

	public resetGame() {
		const boardHTML = document.getElementById("app");
		if (boardHTML) boardHTML.innerHTML = "";

		this.startGame();
	}

	public setSettings() {
		this.width = +this.getValueFromInput("inputWidth");
		this.height = +this.getValueFromInput("inputHeight");
		this.minesFrequency = +this.getValueFromInput("inputMinesFrequency");
		this.playerClass = this.getValueFromInput("selectClass") as playerClasses;
	}

	private getValueFromInput(name: string) {
		const input = document.getElementById(name);
		console.log(input);
		if (input) return (input as HTMLInputElement).value;
		else throw new Error("gameMaster: getValueFromHTML: HTML does not exist");
	}

	public playerUp() {
		this.board.indicateLevelGain();
		this.board.evoluteMonster();
	}

	public calculateScore() {
		this.player.experience;

	}
}