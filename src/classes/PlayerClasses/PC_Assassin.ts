import { Player, SpecialAbility } from "../player";
import { Board } from "../board";
import { Cell } from "../cell";
import { CellType } from "../../util/customTypes";
import { updateSpecialAbilityButton } from "../../content";

export class PC_Assassin extends Player {
        className = "Assassin";
        static description = "The assassin is a master of targeted strikes. They can instantly defeat any monster of the same level using the execute ability.";
        public isExecuteModeActive: boolean = false;

        constructor(board: Board | undefined) {
                super();
                if (!board) {
                        throw new Error("PC_Assassin requires a Board instance during construction.");
                }
                this.health = 2;
                this.maxHealth = this.health;
                this.updateSpecialAbilityButton();
        }

        override getSpecialAbility(): SpecialAbility {
                return {
                        isReady: !this.isExecuteModeActive,
                        isWaiting: this.isExecuteModeActive,
                };
        }

        override useSpecialAbility(): void {
                if (this.isExecuteModeActive) {
                        this.deactivateExecuteMode();
                } else {
                        this.activateExecuteMode();
                }
        }

        private updateSpecialAbilityButton(): void {
                const specialAbilityButton = document.getElementById("specialAbility");
                if (specialAbilityButton) {
                        specialAbilityButton.classList.add("dagger");
                }
        }


        private onAnyAction(cell: Cell, e?: MouseEvent): void {
                if (this.isExecuteModeActive) {
                        this.executeAssassinAttack(cell);
                        // Verhindern, dass die normale Aktion ausgeführt wird
                        e?.preventDefault();
                        e?.stopPropagation();
                }
        }

        override onPrimaryAction(cell: Cell, e?: MouseEvent): void {
                if (this.isExecuteModeActive) {
                        this.onAnyAction(cell, e);
                } else {
                        super.onPrimaryAction(cell, e);
                }
        }

        override onSecondaryAction(cell: Cell, e: MouseEvent): void {
                if (this.isExecuteModeActive) {
                        this.onAnyAction(cell, e);
                } else {
                        super.onSecondaryAction(cell, e);
                }
        }


        public activateExecuteMode(): boolean {
                this.isExecuteModeActive = true;
                document.body.classList.add("execute-mode-active");
                updateSpecialAbilityButton();
                return true;
        }

        public deactivateExecuteMode(): void {
                this.isExecuteModeActive = false;
                document.body.classList.remove("execute-mode-active");
                updateSpecialAbilityButton();
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

                        this.deactivateExecuteMode();
                } else {
                        cell.clickNeighbors();
                }
        }


        override onLevelUp(): void {
                super.onLevelUp();
        }
}

