import { initialize } from "./content";
import { GameMaster } from "./classes/gameMaster";

initialize();

(window as any).gameInstance = GameMaster.getInstance();