import { Player } from "../player";
import { Board } from "../board";
import { Cell } from "../cell";
import { CellType } from "../../util/customTypes";

export class PC_Assassin extends Player {
	className = "Assassin";
	static description = "The assassin is a master of targeted strikes. They can instantly defeat any monster of the same level with a double-click.";

	constructor(_board?: Board) {
		super();
		this.health = 2;
		this.maxHealth = this.health;
	}

       public override onPrimaryAction(cell: Cell, e?: MouseEvent): void {
               if (e && (e.detail === 2 || e.type === "dblclick")) {
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
                } else {
                        super.onPrimaryAction(cell, e);
                }
        }

        public override onSecondaryAction(cell: Cell, e: MouseEvent): void {
                super.onSecondaryAction(cell, e);
        }
}
