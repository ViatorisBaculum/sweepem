import { GameMaster } from "./classes/gameMaster";
import { Modal } from "./util/modal";
import { ThemeManager, Theme } from "./util/theme";

type Nullable<T> = T | null;

const gameInstance = GameMaster.getInstance();
const settingsForm = document.getElementById("template-settings") as Nullable<HTMLTemplateElement>;
const menu = document.getElementById("menu") as Nullable<HTMLElement>;
const leaderboardTemplate = document.getElementById("template-leaderboard") as Nullable<HTMLTemplateElement>;

// Helper to get element and bind event
function bind(
	id: string,
	event: keyof HTMLElementEventMap,
	handler: EventListenerOrEventListenerObject,
	options?: boolean | AddEventListenerOptions
): void {
	const el = document.getElementById(id);
	el?.addEventListener(event, handler, options);
}

export function initialize(): void {
	ThemeManager.initialize();
	setupThemeToggle();

	showInitialModal();
	gameInstance.populateSettingsUIFromGameSettings();
	hide(menu);

	bind("openSettings", "click", showSettings);
	bind("reset", "click", () => gameInstance.resetGame());
	bind("openLeaderboard", "click", () => showLeaderboard());
	bind("debugLevelUp", "click", () => gameInstance.player.debugGainLevel());
}

function showInitialModal(): void {
	assert(settingsForm, "No settings template found");
	const modal = new Modal(document.body);
	modal.setTitle("New Game")
	modal.setSubTitle("Welcome to DungeonSweeper")
	modal.setText(
		"This is a more elaborate version of MineSweeper with RPG elements such as classes, leveling and different enemies. Please choose your starting configuration."
	)
	modal.setSlotContent(settingsForm.innerHTML)
	modal.setConfirmAction((): void => {
		toggle(menu);
		gameInstance.resetGame();
	})
	modal.setDefaultClass();
}

function showSettings(): void {
	assert(settingsForm, "No settings template found");
	const modal = new Modal(document.body, { cancelButton: true });

	modal.setTitle("Game Settings")
	modal.setText("Please choose the settings for your next round")
	modal.setSlotContent(settingsForm.innerHTML)
	modal.setConfirmAction((): void => {
		gameInstance.resetGame();
		toggle(menu);
	})
	modal.setCancelAction((): void => toggle(menu))
	modal.setDefaultClass();

	toggle(menu);
	setupThemeToggle();
	gameInstance.populateSettingsUIFromGameSettings();
}

export function showLeaderboard(status = ""): void {
	assert(leaderboardTemplate, "No leaderboard template found");
	toggle(menu);
	gameInstance.pauseTimer();

	const modal = new Modal(document.body, {
		cancelButton: true,
		confirmButton: false,
		showSubTitle: true,
		showClass: false,
		showClassDescription: false,
		showSlot: false,
	});

	modal.setTitle("Leaderboard")
	modal.setSubTitle(status)
	modal.setText("These are your best scores")
	modal.setLeaderboardContent(gameInstance.getScores())
	modal.setCancelAction((): void => {
		gameInstance.resumeTimer();
		toggle(menu);
	});
}

// Generic show/hide/toggle helpers
function hide(el: Nullable<HTMLElement>): void {
	if (el) el.style.display = "none";
}

// function show(el: Nullable<HTMLElement>, display = "flex"): void {
// 	if (el) el.style.display = display;
// }

function toggle(el: Nullable<HTMLElement>, display = "flex"): void {
	if (!el) return;
	el.style.display = el.style.display === display ? "none" : display;
}

function setupThemeToggle(): void {
	const select = document.getElementById("themeSelect");
	if (!select) return;
	const themeSelect = select as HTMLSelectElement;
	themeSelect.value = ThemeManager.getCurrentTheme();
	themeSelect.onchange = (): void => ThemeManager.setTheme(themeSelect.value as Theme);
}

function assert<T>(cond: T, message: string): asserts cond {
	if (!cond) throw new Error(message);
}
