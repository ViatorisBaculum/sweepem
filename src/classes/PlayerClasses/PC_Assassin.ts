import { Player } from "../player";
import { Board } from "../board";
import { Cell } from "../cell";
import { CellType } from "../../util/customTypes";

export class PC_Assassin extends Player {
        className = "Assassin";
        static description = "The assassin is a master of targeted strikes. They can instantly defeat any monster of the same level using a chord tap (touch with second finger while holding).";
        private readonly CHORD_DELAY = 2000; // Delay in milliseconds for chord tap

        private inputState = {
                cell: null as Cell | null,
                timer: null as number | null,
                isWaiting: false
        };

        constructor(_board?: Board) {
                super();
                this.health = 2;
                this.maxHealth = this.health;
                this.setupInputHandlers();
        }

        private setupInputHandlers() {
                // Touch Events
                document.addEventListener('touchstart', (e: TouchEvent) => {
                        if (e.touches.length === 1) {
                                this.handleFirstInput(e.target as HTMLElement);
                        } else if (e.touches.length === 2 && this.inputState.isWaiting) {
                                this.executeSecondInput(e);
                        }
                });

                // Mouse Events
                document.addEventListener('mousedown', (e: MouseEvent) => {
                        if (e.button === 0) { // Left click
                                this.handleFirstInput(e.target as HTMLElement);
                        } else if (e.button === 2 && this.inputState.isWaiting) { // Right click
                                this.executeSecondInput(e);
                        }
                });

                // Cleanup Events
                const cleanup = () => {
                        if (this.inputState.timer) clearTimeout(this.inputState.timer);
                        this.inputState = { cell: null, timer: null, isWaiting: false };
                };

                document.addEventListener('touchend', cleanup);
                document.addEventListener('mouseup', cleanup);
        }

        private handleFirstInput(target: HTMLElement) {
                if (!target.dataset.x || !target.dataset.y) return;

                const board = (window as any).gameInstance.board;
                this.inputState.cell = board.cells[Number(target.dataset.x)][Number(target.dataset.y)];
                this.inputState.isWaiting = true;

                this.inputState.timer = window.setTimeout(() => {
                        this.inputState = { cell: null, timer: null, isWaiting: false };
                }, this.CHORD_DELAY);
        }

        private executeSecondInput(e: Event) {
                e.preventDefault();
                if (this.inputState.timer) {
                        clearTimeout(this.inputState.timer);
                        if (this.inputState.cell) {
                                this.executeAssassinAttack(this.inputState.cell);
                        }
                }
                this.inputState = { cell: null, timer: null, isWaiting: false };
        }

        private executeAssassinAttack(cell: Cell): void {
                if (!cell.isClicked) {
                        cell.activateCell(0);

                        if (this.level === cell.type || (cell.type === CellType.Boss && this.level >= 5)) {
                                cell.attackPlayer(0);
                        } else if (this.level < cell.type) {
                                cell.attackPlayer();
                        } else {
                                cell.attackPlayer(1);
                        }
                } else {
                        cell.clickNeighbors();
                }
        }
}
