import { initialize } from "./content";
import { GameMaster } from "./classes/gameMaster"; // just for debugging purposes, delete later

initialize();

(window as any).gameInstance = GameMaster.getInstance(); // just for debugging purposes, delete later