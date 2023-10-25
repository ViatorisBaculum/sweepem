import { GameMaster } from "./classes/gameMaster";
import defaults from "./util/defaults";


setValueToInput("inputWidth", defaults.boardDefaults.width);
setValueToInput("inputHeight", defaults.boardDefaults.height);
setValueToInput("inputMinesFrequency", defaults.boardDefaults.minesFrequency);

const gameMaster = GameMaster.getInstance();

gameMaster.setSettings();
gameMaster.createBoard();
gameMaster.createPlayer();

function setValueToInput(name: string, value: number) {
    const input = document.getElementById(name);
    if (input && input.tagName === "INPUT") (input as HTMLInputElement).value = value.toString();
    else throw new Error("app: setValueToInput: HTML does not exist. ID: " + name);
}