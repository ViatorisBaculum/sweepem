import { GameMaster } from "./classes/gameMaster";
import { Modal } from "./util/modal";

const settingsForm = document.getElementById("template-settings");

export function initialize() {
	const settingsButton = document.getElementById("openSettings");
	initalModal();
	if (settingsButton)
		settingsButton.addEventListener("click", () => toggleSettings(), false);
}
function initalModal() {
	if (!settingsForm) throw new Error("No settings template found");

	const modal = new Modal(document.body);
	modal.setTitle("New Game");
	modal.setSubTitle("Welcome to DungeonSweeper");
	modal.setText(
		"This is a more elaborate version of MineSweeper with RPG elements such as classes, leveling and different enemies. Please choose your starting configuration."
	);
	modal.setSlotContent(settingsForm.innerHTML);
	modal.setConfirmAction(() => GameMaster.getInstance().resetGame());
}

function toggleSettings() {
	if (!settingsForm) throw new Error("No settings template found");

	const modal = new Modal(document.body);
	modal.setTitle("Game Settings");
	modal.setText("Please choose the settings for your next round");
	modal.setSlotContent(settingsForm.innerHTML);
	modal.setConfirmAction(() => GameMaster.getInstance().resetGame());
}
