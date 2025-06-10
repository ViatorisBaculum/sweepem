import { GameMaster } from "./classes/gameMaster";
import { Modal } from "./util/modal";
import { ThemeManager, Theme } from "./util/theme";
import { PC_Mage } from "./classes/PlayerClasses/PC_Mage";
import { SaveManager } from "./classes/saveManager";

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
	setupFireball();
	showInitialModal();
	gameInstance.populateSettingsUIFromGameSettings();
	hide(menu);

	bind("openSettings", "click", showSettings);
	bind("reset", "click", () => gameInstance.resetGame());
	bind("openLeaderboard", "click", () => showLeaderboard());
	bind("debugLevelUp", "click", () => gameInstance.player.debugGainLevel());
}

export function showMenu(): void {
	show(menu);
}

function showInitialModal(): void {
	assert(settingsForm, "No settings template found");
	const modal = new Modal(document.body, { cancelButton: false, showSubTitle: false });

	modal.setTitle("Welcome to DungeonSweeper");
	//modal.setSubTitle("lorem ipsum dolor sit amet");
	modal.setText("This is a more elaborate version of MineSweeper with RPG elements such as classes, leveling and different enemies. Please choose your starting configuration.");
	modal.setSlotContent(settingsForm.innerHTML);

	// Default: New Game
	modal.setConfirmButtonText("New Game");
	modal.setConfirmAction((): void => {
		showMenu();
		gameInstance.resetGame();
	});

	// If savegame exists, add Continue button
	if (SaveManager.hasSave()) {
		modal.setConfirmButtonText("New Game"); // Isnt this redundant?
		modal.setConfirmAction((): void => {
			SaveManager.deleteSave();
			showMenu();
			gameInstance.resetGame();
		});

		modal.setSecondaryConfirmButtonText("Continue");
		modal.setSecondaryConfirmAction(() => {
			const memento = SaveManager.loadGame();
			if (memento) {
				gameInstance.restoreFromMemento(memento);
				gameInstance.player.updateStatsheet();
				gameInstance.board.redraw();
				showMenu();
			}
		});
	}

	modal.setDefaultClass();
	setupThemeToggle();
	gameInstance.populateSettingsUIFromGameSettings();

	// Remove debug switch from settings HTML before injecting
	const debugLabel = document.getElementById("modal-debug");
	if (debugLabel) debugLabel.remove();
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

	// just for debugging purposes
	try {
		gameInstance.board.setupDebugUI();
	} catch (e) { }
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

function show(el: Nullable<HTMLElement>, display = "flex"): void {
	if (el) el.style.display = display;
}

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

function setupFireball() {
	const fireballBtn = document.getElementById("fireball") as HTMLButtonElement | null;
	if (!fireballBtn) return;

	const eventType = 'click';

	fireballBtn.addEventListener(eventType, (e) => {
		e.preventDefault();
		e.stopPropagation();

		if (gameInstance.player.className !== "Mage") {
			return;
		}
		const mage = gameInstance.player as PC_Mage;

		if (mage.isFireballModeActive) {
			mage.deactivateFireballMode();
		} else {
			// activateFireballMode now returns a boolean indicating success
			if (!mage.activateFireballMode()) {
				console.log("Fireball not ready or player cannot cast.");
			}
		}
		// UI updates are now handled within PC_Mage methods via resetFireballButton call
	});
}

export function resetFireballButton() {
	const fireballBtn = document.getElementById("fireball") as HTMLButtonElement | null;
	if (!fireballBtn) return;

	const setButtonAppearance = (isWaiting: boolean, isReady: boolean) => {
		if (isWaiting) {
			fireballBtn.classList.add("fireball-waiting");
		} else {
			fireballBtn.classList.remove("fireball-waiting");
		}

		if (isReady) {
			fireballBtn.classList.add("fireball-ready");
		} else {
			fireballBtn.classList.remove("fireball-ready");
		}
	};

	const player = gameInstance.player;

	if (player.className === "Mage") {
		const mage = player as PC_Mage;
		fireballBtn.style.display = "";

		if (mage.isFireballModeActive) {
			setButtonAppearance(true, false);
		} else if (mage.canCastFireball()) {
			setButtonAppearance(false, true);
		} else {
			setButtonAppearance(false, false);
		}
	} else {
		fireballBtn.style.display = "none";
		setButtonAppearance(false, false);
	}
}