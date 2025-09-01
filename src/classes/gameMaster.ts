import { PC_Assassin } from "./PlayerClasses/PC_Assassin";
import { PC_Mage } from "./PlayerClasses/PC_Mage";
import { PC_Paladin } from "./PlayerClasses/PC_Paladin";
import { PC_Warrior } from "./PlayerClasses/PC_Warrior";
import { Board } from "./board";
import { Player } from "./player";
import { playerClasses, BoardSize, Difficulty } from "../util/customTypes";
import defaults from "../util/defaults";
import { showLeaderboard, updateSpecialAbilityButton } from "../content";
import { SaveManager, GameMemento, GameSettings } from "./saveManager";
import { BoardDimensions, DifficultySettings } from "../util/defaults";

enum GameState {
	NotStarted,
	Running,
	Paused,
	Ended
}

// GameSettings interface is now imported from saveManager

export class GameMaster {
	private static instance: GameMaster;
	private _board?: Board;
	private _player?: Player;
	private _timer?: NodeJS.Timeout;
	private _gameTimer: number = 0;
	private _gameSettings!: GameSettings;
	private saveManager: SaveManager;
	private _gameState: GameState = GameState.NotStarted;

	private playerClassRegistry: Record<playerClasses, (new (board: Board | undefined) => Player) & { description: string }> = {
		"Assassin": PC_Assassin,
		"Mage": PC_Mage,
		"Paladin": PC_Paladin,
		"Warrior": PC_Warrior,
	};

	private constructor() {
		document.getElementById("resetButton")?.addEventListener("click", () => this.resetGame());
		this.saveManager = SaveManager.getInstance();
		this._gameSettings = this.initializeGameSettings();
		this.populateSettingsUIFromGameSettings();

		const trySave = () => {
			if (this._gameState !== GameState.Ended) {
				this.saveManager.saveGame(this);
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
	public getBoardElement(): HTMLElement {
		const boardElement = document.getElementById("app");
		if (!boardElement) throw new Error("Board element not found in the DOM!");
		return boardElement;
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
		const dims = BoardDimensions[this._gameSettings.boardSize];
		const minesFrequency = DifficultySettings[this._gameSettings.difficulty].minesFrequency;
		this.board = new Board(dims.width, dims.height, minesFrequency, this);
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
			boardSize: BoardSize.Medium,
			difficulty: Difficulty.Beginner,
			playerClass: defaults.playerClass,
			invertClicks: defaults.boardDefaults.invertClicks,
			removeFlags: defaults.boardDefaults.removeFlags
		};
	}

	private initializeGameSettings(): GameSettings {
		const defaults_ = this.loadDefaultSettings();
		// First try to load from the new settings storage
		const settings = this.saveManager.loadSettings(defaults_);
		// If no settings found in new storage, try to load from old instance storage for backward compatibility
		if (!this.saveManager.hasSettings()) {
			return this.saveManager.loadInstanceSettings(defaults_);
		}
		return settings;
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
		// Reset the isGameEnded flag in the save manager
		this.saveManager.resetGameEnded();
		this.startGame();
	}

	public stopGame(): void {
		// Save the current game state before stopping
		try {
			if (this._gameState !== GameState.Ended) {
				this.saveManager.saveGame(this);
			}
		} catch (error) {
			console.error("Error saving game state:", error);
		}

		// Stop any active timers
		this.stopTimer();

		// Set game state to ended to prevent further actions
		this._gameState = GameState.Ended;

		// Remove event handlers to prevent background processes
		if (this._board) {
			this._board.removeEventHandler();
		}

		// Hide the game board
		const boardElement = document.getElementById("app");
		if (boardElement) {
			boardElement.innerHTML = "";
		}

		// Reset UI elements
		this.resetHeartContainer();

		// Ensure no new game is automatically started
		// We don't call startGame() here, which is what resetGame does
	}

	public saveSettingsFromUI(): void {
		try {
			// Try to save each setting individually so that if one fails, others can still be saved
			try {
				this._gameSettings.boardSize = this.getValueFromInput("boardSize") as BoardSize;
			} catch (e) {
				console.warn("Could not save boardSize setting:", e);
			}

			try {
				this._gameSettings.difficulty = this.getValueFromInput("difficulty") as Difficulty;
			} catch (e) {
				console.warn("Could not save difficulty setting:", e);
			}

			try {
				this._gameSettings.playerClass = this.getValueFromInput("selectClass") as playerClasses;
			} catch (e) {
				console.warn("Could not save playerClass setting:", e);
			}

			try {
				this._gameSettings.invertClicks = this.getCheckedFromToggle("invertClicks");
			} catch (e) {
				console.warn("Could not save invertClicks setting:", e);
			}

			try {
				this._gameSettings.removeFlags = this.getCheckedFromToggle("removeFlags");
			} catch (e) {
				console.warn("Could not save removeFlags setting:", e);
			}

			// Save settings using the new SaveManager
			this.saveManager.saveSettings(this._gameSettings);
			// Also update settings in any existing saved game
			this.saveManager.updateGameSettings(this._gameSettings);
			// Save the current game state if a game is in progress
			this.saveManager.saveGame(this);
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
		// Save the game state immediately after starting a new game
		this.saveManager.saveGame(this);
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
		this.saveManager.updateLeaderboard(score);
	}

	public getScores(): number[] {
		return this.saveManager.loadLeaderboard();
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
		// Check if the memento is valid
		if (!this.isValidGameSettings(memento.gameSettings)) {
			console.warn("Invalid game settings in memento. Deleting save and using defaults.");
			this.saveManager.deleteSave();
			this._gameSettings = this.loadDefaultSettings();
		} else {
			this._gameSettings = memento.gameSettings as GameSettings;
		}

		this.populateSettingsUIFromGameSettings();
		this.createBoard();
		this.createPlayer();

		this.board.restoreFromMemento(memento.board);
		this.board.centerOnOpenedCell();
		this.player.restoreFromMemento(memento.player);
		// Apply the level class to the board after restoring the player state
		this.board.indicateLevelGain(this.player.level);
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
		this.saveManager.deleteSave();
	}

	private getValueFromInput(name: string) {
		const input = document.getElementById(name);
		if (input) return (input as HTMLSelectElement).value;
		else throw new Error(`HTML input element with id '${name}' not found.`);
	}

	private getCheckedFromToggle(name: string): boolean {
		const input = document.getElementById(name);
		if (input) return (input as HTMLInputElement).checked;
		else throw new Error(`HTML input (checkbox/toggle) element with id '${name}' not found.`);
	}

	public populateSettingsUIFromGameSettings(): void {
		this.trySetInputValue("boardSize", this._gameSettings.boardSize);       // "small" | "medium" | ...
		this.trySetInputValue("difficulty", this._gameSettings.difficulty);     // "beginner" | "intermediate" | ...
		this.trySetInputValue("selectClass", this._gameSettings.playerClass);
		this.trySetToggleValue("invertClicks", this._gameSettings.invertClicks);
		this.trySetToggleValue("removeFlags", this._gameSettings.removeFlags);
	}

	private trySetInputValue(id: string, value: string): void {
		const input = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
		if (input) input.value = value;
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

	// Strikte Validierung: falls etwas nicht passt -> altes Save wird verworfen
	private isValidGameSettings(data: any): data is GameSettings {
		if (!data || typeof data !== "object") return false;

		const validBoardSize = Object.values(BoardSize).includes(data.boardSize);
		const validDifficulty = Object.values(Difficulty).includes(data.difficulty);
		const validPlayerClass = typeof data.playerClass === "string" && (data.playerClass in this.playerClassRegistry);
		const validInvert = typeof data.invertClicks === "boolean";
		const validRemove = typeof data.removeFlags === "boolean";

		return !!(validBoardSize && validDifficulty && validPlayerClass && validInvert && validRemove);
	}
}
