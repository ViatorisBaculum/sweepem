import { CellType } from "../util/customTypes";

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
    gameSettings: any;
}

// Caretaker
export const SaveManager = {
    saveKey: "saveGame",
    isGameEnded: false,

    saveGame(): void {
        if (this.isGameEnded) return;
        try {
            const game = (window as any).gameInstance;
            const memento = game.createMemento();
            localStorage.setItem(this.saveKey, JSON.stringify(memento));
            console.log("Game saved.");
        } catch (error) {
            console.error("Could not save game state:", error);
        }
    },

    loadGame(): GameMemento | null {
        try {
            const savedGame = localStorage.getItem(this.saveKey);
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
    },

    deleteSave(): void {
        console.log("Deleting save file.");
        this.isGameEnded = true;
        localStorage.removeItem(this.saveKey);
    },

    hasSave(): boolean {
        return localStorage.getItem(this.saveKey) !== null;
    }
}; 