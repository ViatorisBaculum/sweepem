import { GameMaster } from "./classes/gameMaster";
import defaults from "./util/defaults";


setValueToInput("inputWidth", defaults.boardDefaults.width.toString());
setValueToInput("inputHeight", defaults.boardDefaults.height.toString());
setValueToInput("inputMinesFrequency", defaults.boardDefaults.minesFrequency.toString());
setValueToInput("selectClass", defaults.playerClass);

const gameMaster = GameMaster.getInstance();

gameMaster.setSettings();
gameMaster.createBoard();
gameMaster.createPlayer();

function setValueToInput(name: string, value: string) {
    const input = document.getElementById(name);
    if (input) (input as HTMLInputElement).value = value;
    else throw new Error("app: setValueToInput: HTML does not exist. ID: " + name);
}