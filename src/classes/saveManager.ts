import { CellType } from "../util/customTypes";
import { BoardSize, Difficulty, playerClasses } from "../util/customTypes";

// Memento Interfaces
export interface CellMemento {
    type: CellType;
    value?: number;
    isClicked: boolean;
    isFlagged: boolean;
}

export interface BoardMemento {
    cells: CellMemento[][];
}

export interface PlayerMemento {
    className: string;
    experience: number;
    health: number;
    maxHealth: number;
    level: number;
    score: number;
    // Class-specific state
    fireballAvailable?: boolean;
}

export interface GameMemento {
    board: BoardMemento;
    player: PlayerMemento;
    gameTimer: number;
    gameSettings: GameSettings;
}

// Settings Interface
export interface GameSettings {
    boardSize: BoardSize;
    difficulty: Difficulty;
    playerClass: playerClasses;
    invertClicks: boolean;
    removeFlags: boolean;
}

// Storage Keys
const STORAGE_KEYS = {
    GAME_STATE: "saveGame",
    SETTINGS: "gameSettings",
    LEADERBOARD: "leaderboard",
    INSTANCE: "instance" // For backward compatibility
};

export class SaveManager {
    private static instance: SaveManager;
    private isGameEnded: boolean = false;

    private constructor() {
        // Private constructor to prevent direct instantiation
    }

    static getInstance(): SaveManager {
        if (!SaveManager.instance) {
            SaveManager.instance = new SaveManager();
        }
        return SaveManager.instance;
    }

    // Game State Methods
    saveGame(game: any): void {
        if (this.isGameEnded) return;
        try {
            const memento = game.createMemento();
            localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(memento));
            console.log("Game saved.");
        } catch (error) {
            console.error("Could not save game state:", error);
        }
    }

    loadGame(): GameMemento | null {
        try {
            const savedGame = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
            if (savedGame) {
                const memento = JSON.parse(savedGame);
                console.log("Game loaded.");
                return memento;
            }
            return null;
        } catch (error) {
            console.error("Could not load game state:", error);
            this.deleteSave();
            return null;
        }
    }

    deleteSave(): void {
        console.log("Deleting save file.");
        this.isGameEnded = true;
        localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
    }

    // Method to reset the isGameEnded flag
    resetGameEnded(): void {
        this.isGameEnded = false;
    }

    hasSave(): boolean {
        return localStorage.getItem(STORAGE_KEYS.GAME_STATE) !== null;
    }

    // Settings Methods
    saveSettings(settings: GameSettings): void {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
            console.log("Settings saved.");
        } catch (error) {
            console.error("Could not save settings:", error);
        }
    }

    loadSettings(defaults: GameSettings): GameSettings {
        try {
            const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                // Validate settings before returning
                if (this.isValidGameSettings(parsed)) {
                    return parsed as GameSettings;
                } else {
                    console.warn("Invalid stored settings found. Clearing and using defaults.");
                    this.deleteSettings();
                    return defaults;
                }
            }
            return defaults;
        } catch (e) {
            console.error("Failed to parse stored settings. Clearing and using defaults.", e);
            this.deleteSettings();
            return defaults;
        }
    }

    deleteSettings(): void {
        console.log("Deleting settings.");
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    }

    hasSettings(): boolean {
        return localStorage.getItem(STORAGE_KEYS.SETTINGS) !== null;
    }

    // Method to update settings in an existing saved game
    updateGameSettings(settings: GameSettings): void {
        try {
            // Load the existing saved game
            const savedGame = this.loadGame();
            if (savedGame) {
                // Update the settings in the saved game
                savedGame.gameSettings = settings;
                // Save the updated game back to localStorage
                localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(savedGame));
                console.log("Game settings updated in saved game.");
            } else {
                console.log("No saved game found to update settings.");
            }
        } catch (error) {
            console.error("Could not update game settings in saved game:", error);
        }
    }

    // Leaderboard Methods
    updateLeaderboard(score: number): void {
        try {
            const leaderboard: number[] = this.loadLeaderboard();
            leaderboard.push(score);
            leaderboard.sort((a, b) => b - a);
            const topScores = leaderboard.slice(0, 10);
            localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(topScores));
        } catch (error) {
            console.error("Could not update leaderboard:", error);
        }
    }

    loadLeaderboard(): number[] {
        try {
            const leaderboardData = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
            return leaderboardData ? JSON.parse(leaderboardData) : [];
        } catch (error) {
            console.error("Could not load leaderboard:", error);
            return [];
        }
    }

    // Backward compatibility methods
    loadInstanceSettings(defaults: GameSettings): GameSettings {
        try {
            const savedInstance = localStorage.getItem(STORAGE_KEYS.INSTANCE);
            if (savedInstance) {
                const parsed = JSON.parse(savedInstance);
                // Validate settings before returning
                if (this.isValidGameSettings(parsed)) {
                    return parsed as GameSettings;
                } else {
                    console.warn("Invalid stored instance settings found. Clearing.");
                    this.deleteInstanceSettings();
                    return defaults;
                }
            }
            return defaults;
        } catch (e) {
            console.error("Failed to parse stored instance settings. Clearing.", e);
            this.deleteInstanceSettings();
            return defaults;
        }
    }

    deleteInstanceSettings(): void {
        console.log("Deleting instance settings.");
        localStorage.removeItem(STORAGE_KEYS.INSTANCE);
    }

    // Validation method
    private isValidGameSettings(data: any): data is GameSettings {
        if (!data || typeof data !== "object") return false;

        // Check if all required properties exist
        const hasBoardSize = typeof data.boardSize === "string";
        const hasDifficulty = typeof data.difficulty === "string";
        const hasPlayerClass = typeof data.playerClass === "string";
        const hasInvertClicks = typeof data.invertClicks === "boolean";
        const hasRemoveFlags = typeof data.removeFlags === "boolean";

        return hasBoardSize && hasDifficulty && hasPlayerClass && hasInvertClicks && hasRemoveFlags;
    }

    // Direct localStorage editing methods for debugging
    getRawData(key: string): string | null {
        return localStorage.getItem(key);
    }

    setRawData(key: string, value: string): void {
        localStorage.setItem(key, value);
    }

    removeRawData(key: string): void {
        localStorage.removeItem(key);
    }

    getAllStoredData(): Record<string, string> {
        const data: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                data[key] = localStorage.getItem(key) || "";
            }
        }
        return data;
    }

    clearAllData(): void {
        localStorage.clear();
        console.log("All localStorage data cleared.");
    }
}