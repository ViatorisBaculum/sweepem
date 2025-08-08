import { PC_Assassin } from "./PlayerClasses/PC_Assassin";
import { PC_Mage } from "./PlayerClasses/PC_Mage";
import { PC_Paladin } from "./PlayerClasses/PC_Paladin";
import { PC_Warrior } from "./PlayerClasses/PC_Warrior";
import { Board } from "./board";
import { Player } from "./player";
import defaults from "../util/defaults";
import { playerClasses } from "../util/customTypes";
import { showLeaderboard, updateSpecialAbilityButton } from "../content";
import { SaveManager, GameMemento } from "./saveManager";

enum GameState {
	NotStarted,
	Running,
	Paused,
	Ended
}

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
	private _gameSettings!: GameSettings;
	private _gameState: GameState = GameState.NotStarted;
	private playerClassRegistry: Record<playerClasses, (new (board: Board | undefined) => Player) & { description: string }> = {
		"Assassin": PC_Assassin,
		"Mage": PC_Mage,
		"Paladin": PC_Paladin,
		"Warrior": PC_Warrior,
	};

	private constructor() {
		document.getElementById("resetButton")?.addEventListener("click", () => this.resetGame());
		this._gameSettings = this.initializeGameSettings();
		this.populateSettingsUIFromGameSettings();

		const trySave = () => {
			if (this._gameState !== GameState.Ended) {
				SaveManager.saveGame();
			}
		};

		window.addEventListener("beforeunload", trySave);

		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "hidden") {
				trySave();
				this.pauseTimer();
			} else if (document.visibilityState === "visible") {
				if (this._gameState === GameState.Paused) {
					this.resumeTimer();
				}
			}
		});
	}


	static getInstance() {
		if (!GameMaster.instance) {
			GameMaster.instance = new GameMaster();
			return GameMaster.instance;
		} else {
			return GameMaster.instance;
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
		this.board = new Board(this._gameSettings.width, this._gameSettings.height, this._gameSettings.minesFrequency, this);
	}

	public createPlayer() {
		const PlayerClassConstructor = this.playerClassRegistry[this._gameSettings.playerClass];
		if (PlayerClassConstructor) {
			this.player = new PlayerClassConstructor(this._board);
		} else {
			console.error(`Unknown player class: ${this._gameSettings.playerClass}. Defaulting to Warrior.`);
			this.player = new PC_Warrior(this._board);
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

	private initializeGameSettings(): GameSettings {
		const defaultSettings = this.loadDefaultSettings();
		const localSettings = localStorage.getItem("instance");
		if (localSettings) {
			try {
				const storedSettings = JSON.parse(localSettings) as Partial<GameSettings>;
				return {
					...defaultSettings,
					...storedSettings,
					width: storedSettings.width !== undefined ? +storedSettings.width : defaultSettings.width,
					height: storedSettings.height !== undefined ? +storedSettings.height : defaultSettings.height,
					minesFrequency: storedSettings.minesFrequency !== undefined ? +storedSettings.minesFrequency : defaultSettings.minesFrequency,
					playerClass: storedSettings.playerClass || defaultSettings.playerClass,
					invertClicks: typeof storedSettings.invertClicks === 'boolean' ? storedSettings.invertClicks : defaultSettings.invertClicks,
					removeFlags: typeof storedSettings.removeFlags === 'boolean' ? storedSettings.removeFlags : defaultSettings.removeFlags,
				};
			} catch (error) {
				console.error("Failed to parse stored settings, using defaults and removing corrupted item.", error);
				localStorage.removeItem("instance");
				return defaultSettings;
			}
		}
		return defaultSettings;
	}

	public playerUp() {
		this.board.indicateLevelGain(this.player.level);
		this.board.evoluteMonster();
		if (this._gameSettings.removeFlags) this.board.removeAllFlags();
	}

	public resetGame() {
		if (this._gameState === GameState.Running || this._gameState === GameState.Paused) {
			this.stopTimer();
		}
		if (this._board) {
			this._board.removeEventHandler();
		}
		this._gameState = GameState.NotStarted;

		const boardHTML = document.getElementById("app");
		if (boardHTML) boardHTML.innerHTML = "";

		this.resetHeartContainer();
		this.startGame();
	}

	public saveSettingsFromUI(): void {
		try {
			this._gameSettings.width = +this.getValueFromInput("inputWidth");
			this._gameSettings.height = +this.getValueFromInput("inputHeight");
			this._gameSettings.minesFrequency = +this.getValueFromInput("minesFrequency");
			this._gameSettings.playerClass = this.getValueFromInput("selectClass") as playerClasses;
			this._gameSettings.invertClicks = this.getCheckedFromToggle("invertClicks");
			this._gameSettings.removeFlags = this.getCheckedFromToggle("removeFlags");

			localStorage.setItem("instance", JSON.stringify(this._gameSettings));
		} catch (error) {
			console.error("Error saving settings from UI:", error);
		}
	}

	public startGame() {
		if (this._gameState === GameState.Running) return;
		if (document.getElementById("modal")) this.saveSettingsFromUI();
		if (document.getElementById("modal")) this.getScores();
		this.createBoard();
		this.createPlayer();
		updateSpecialAbilityButton();
		this._board?.openStartArea();

		this.resetTimer();
		this._timer = setInterval(() => this.countSeconds(), 1000);
		this._gameState = GameState.Running;
		SaveManager.isGameEnded = false;
	}

	public winGame() {
		this.endGame();
		this.updateLeaderboard(this.player.score);
		this.displayLeaderboard(`You won! Score: ${this.player.score}`);
	}

	public loseGame() {
		this.endGame();
		this.displayLeaderboard("You lost!");
	}

	public pauseTimer() {
		if (this._timer && this._gameState === GameState.Running) {
			clearInterval(this._timer);
			this._timer = undefined;
			this._gameState = GameState.Paused;
		}
	}

	public resumeTimer() {
		if (this._gameState === GameState.Paused) {
			this._timer = setInterval(() => this.countSeconds(), 1000);
			this._gameState = GameState.Running;
		}
	}

	public updateLeaderboard(score: number) {
		const leaderboardKey = "leaderboard";
		const leaderboard: number[] = JSON.parse(localStorage.getItem(leaderboardKey) || "[]");

		leaderboard.push(score);

		leaderboard.sort((a, b) => b - a);

		const topScores = leaderboard.slice(0, 10);

		localStorage.setItem(leaderboardKey, JSON.stringify(topScores));
	}

	public getScores(): number[] {
		const leaderboardKey = "leaderboard";
		return JSON.parse(localStorage.getItem(leaderboardKey) || "[]");
	}

	public displayLeaderboard(statusText?: string) {
		showLeaderboard(statusText);
	}

	public isGameEnded(): boolean {
		return this._gameState === GameState.Ended;
	}

	public createMemento(): GameMemento {
		return {
			board: this.board.createMemento(),
			player: this.player.createMemento(),
			gameTimer: this._gameTimer,
			gameSettings: this._gameSettings,
		};
	}

	public restoreFromMemento(memento: GameMemento): void {
		this._gameSettings = memento.gameSettings;
		this.populateSettingsUIFromGameSettings();
		this.createBoard();
		this.createPlayer();

		this.board.restoreFromMemento(memento.board);
		this.player.restoreFromMemento(memento.player);
		this._gameTimer = memento.gameTimer;
		this._gameState = GameState.Paused; // set to paused, because resumeTimer will set it to running
		this.resumeTimer();
	}

	/*===============*/
	/*private methods*/
	/*===============*/

	private countSeconds() {
		this._gameTimer++;
		this.player.calculateScore(this._gameTimer);
	}

	private endGame() {
		if (this._gameState === GameState.Ended) return;
		this.stopTimer();
		this._gameState = GameState.Ended;
		this.board.revealBoard(true);
		SaveManager.deleteSave();
	}

	private getValueFromInput(name: string) {
		const input = document.getElementById(name);
		if (input) return (input as HTMLInputElement).value;
		else throw new Error(`HTML input element with id '${name}' not found.`);
	}

	private getCheckedFromToggle(name: string): boolean {
		const input = document.getElementById(name);
		if (input) return (input as HTMLInputElement).checked;
		else throw new Error(`HTML input (checkbox/toggle) element with id '${name}' not found.`);
	}

	public populateSettingsUIFromGameSettings(): void {
		this.trySetInputValue("inputWidth", this._gameSettings.width.toString());
		this.trySetInputValue("inputHeight", this._gameSettings.height.toString());
		this.trySetInputValue("minesFrequency", this._gameSettings.minesFrequency.toString());
		this.trySetInputValue("selectClass", this._gameSettings.playerClass);
		this.trySetToggleValue("invertClicks", this._gameSettings.invertClicks);
		this.trySetToggleValue("removeFlags", this._gameSettings.removeFlags);
	}

	private trySetInputValue(id: string, value: string): void {
		const input = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
		if (input) {
			input.value = value;
		}
		else console.warn(`HTML input element with id '${id}' not found for setting value.`);
	}

	private trySetToggleValue(id: string, checked: boolean): void {
		const toggle = document.getElementById(id) as HTMLInputElement | null;
		if (toggle) toggle.checked = checked;
	}

	public updateClassDescription(className: playerClasses): void {
		const PlayerClass = this.playerClassRegistry[className];
		if (PlayerClass) {
			const descriptionElement = document.getElementById("modal-classDescription");
			if (descriptionElement) {
				descriptionElement.innerText = PlayerClass.description;
			}
		}
	}

	private resetTimer() {
		this.stopTimer();
		this._gameTimer = 0;
		const timerElement = document.getElementById("timer");
		if (timerElement) timerElement.innerText = "00:00";
	}

	private stopTimer() {
		clearInterval(this._timer);
	}

	private resetHeartContainer() {
		const hearts = document.getElementById("health");
		if (hearts) hearts.innerHTML = "";
	}
}
