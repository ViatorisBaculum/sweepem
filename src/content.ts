import { GameMaster } from "./classes/gameMaster";
import { Modal } from "./util/modal";

const settingsForm = document.getElementById("template-settings");
const menu = document.getElementById("menu");
const leaderboard = document.getElementById("template-leaderboard");

export function initialize() {
	initalModal();

	const settingsButton = document.getElementById("openSettings");
	if (settingsButton)
		settingsButton.addEventListener("click", () => toggleSettings(), false);

	const resetButton = document.getElementById("reset");
	if (resetButton) resetButton.addEventListener("click", () => resetGame(), false);

	const leaderboardButton = document.getElementById("openLeaderboard");
	if (leaderboardButton) leaderboardButton.addEventListener("click", () => showLeaderboard(), false);

	if (menu) menu.style.display = "none";

	GameMaster.getInstance().getSettings();
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
	modal.setConfirmAction(() => toggleMenuBar());
}

function toggleMenuBar() {
	if (menu && menu.style.display === "flex") menu.style.display = "none";
	else if (menu && menu.style.display === "none") menu.style.display = "flex";

	GameMaster.getInstance().resetGame()
}

function toggleSettings() {
	if (!settingsForm) throw new Error("No settings template found");

	toggleMenuBar();

	const modal = new Modal(document.body, { cancelButton: true });
	modal.setTitle("Game Settings");
	modal.setText("Please choose the settings for your next round");
	modal.setSlotContent(settingsForm.innerHTML);
	modal.setConfirmAction(() => {
		GameMaster.getInstance().resetGame();
		toggleMenuBar();
	});
	modal.setCancelAction(() => toggleMenuBar());
}

function resetGame() {
	GameMaster.getInstance().resetGame();
}

export function showLeaderboard() {
	if (!leaderboard) throw new Error("No leaderboard template found");

	toggleMenuBar();

	const modal = new Modal(document.body, {
		cancelButton: true,
		confirmButton: false,
		showSubTitle: false,
		showClass: false,
		showClassDescription: false,
		showSlot: false
	});
	modal.setTitle("Leaderboard");
	modal.setText("These are your best scores");
	const scores = GameMaster.getInstance().getLeaderboard();
	console.log(scores);
	modal.setLeaderboardContent(scores);
	modal.setCancelAction(() => toggleMenuBar());
}