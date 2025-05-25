import { GameMaster } from "./classes/gameMaster";
import { Modal } from "./util/modal";
import { ThemeManager, Theme } from "./util/theme";

const settingsForm = document.getElementById("template-settings");
const menu = document.getElementById("menu");
const leaderboard = document.getElementById("template-leaderboard");

export function initialize() {

	initalModal();
	ThemeManager.initialize();
	setupThemeToggle();

	const settingsButton = document.getElementById("openSettings");
	if (settingsButton)
		settingsButton.addEventListener("click", () => toggleSettings(), false);

	const resetButton = document.getElementById("reset");
	if (resetButton) resetButton.addEventListener("click", () => resetGame(), false);

	const leaderboardButton = document.getElementById("openLeaderboard");
	if (leaderboardButton) leaderboardButton.addEventListener("click", () => showLeaderboard(), false);

	if (menu) menu.style.display = "none";

	GameMaster.getInstance().getSettings();



	// Debug buttons
	const debugLevelUpButton = document.getElementById("debugLevelUp");
	if (debugLevelUpButton) {
		debugLevelUpButton.addEventListener("click", () => {
			GameMaster.getInstance().player.debugGainLevel();
		});
	}
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
	modal.setConfirmAction(() => {
		toggleMenuBar();
		GameMaster.getInstance().resetGame();
	});
}

function toggleMenuBar() {
	if (menu && menu.style.display === "flex") menu.style.display = "none";
	else if (menu && menu.style.display === "none") menu.style.display = "flex";
}

function toggleSettings() {
	if (!settingsForm) throw new Error("No settings template found");

	const modal = new Modal(document.body, { cancelButton: true });
	modal.setTitle("Game Settings");
	modal.setText("Please choose the settings for your next round");
	modal.setSlotContent(settingsForm.innerHTML);

	toggleMenuBar();
	setupThemeToggle();

	modal.setConfirmAction(() => {
		GameMaster.getInstance().resetGame();
		toggleMenuBar();
	});
	modal.setCancelAction(() => toggleMenuBar());

	GameMaster.getInstance().getSettings();
}

function resetGame() {
	GameMaster.getInstance().resetGame();
}

export function showLeaderboard(statusText?: string) {
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
	modal.setText(statusText ? statusText + "\nThese are your best scores" : "These are your best scores");
	const scores = GameMaster.getInstance().getLeaderboard();
	modal.setLeaderboardContent(scores);
	modal.setCancelAction(() => toggleMenuBar());
}

function setupThemeToggle() {
	const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
	if (!themeSelect) return;

	// Set initial value
	const currentTheme = ThemeManager.getCurrentTheme();
	themeSelect.value = currentTheme;

	// Add change listener
	themeSelect.addEventListener('change', () => {
		ThemeManager.setTheme(themeSelect.value as Theme);
	});
}