import { PC_Assassin } from "./PlayerClasses/PC_Assassin";
import { PC_Mage } from "./PlayerClasses/PC_Mage";
import { PC_Paladin } from "./PlayerClasses/PC_Paladin";
import { PC_Warrior } from "./PlayerClasses/PC_Warrior";
import { Board } from "./board";
import { Player } from "./player";

export class GameMaster {
	private static instance: GameMaster;
	private _board?: Board;
	private _player?: Player;

	private constructor() { }
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

	public createBoard(width: number, height: number, minesFreq: number) {
		this.board = new Board(width, height, minesFreq);
	}

	public createPlayer(playerClass: "Assassin" | "Mage" | "Paladin" | "Warrior") {
		switch (playerClass) {
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
}