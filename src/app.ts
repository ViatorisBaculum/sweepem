import { GameMaster } from "./classes/gameMaster";
import defaults from "./util/defaults";
import { initialize } from "./content";
import { Modal } from "./util/modal";

const settingsForm = document.getElementById("template-settings");
if (!settingsForm) throw new Error("No settings template found");

setValueToInput("inputWidth", defaults.boardDefaults.width.toString());
setValueToInput("inputHeight", defaults.boardDefaults.height.toString());
setValueToInput(
	"inputMinesFrequency",
	defaults.boardDefaults.minesFrequency.toString()
);
setValueToInput("selectClass", defaults.playerClass);

const gameMaster = GameMaster.getInstance();
const modal = new Modal(document.body);
modal.setH1("New Game");
modal.setSlotContent(settingsForm.innerHTML);
modal.setConfirmAction(getGameSettings);

gameMaster.startGame();
initialize();

function getGameSettings() {
	gameMaster.startGame();
}

function setValueToInput(name: string, value: string) {
	const input = document.getElementById(name);
	if (input) (input as HTMLInputElement).value = value;
	else
		throw new Error("app: setValueToInput: HTML does not exist. ID: " + name);
}
