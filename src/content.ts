import { GameMaster } from "./classes/gameMaster";
import { Modal } from "./util/modal";
import { ThemeManager, Theme } from "./util/theme";
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
	setupSpecialAbilityButton();
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

	modal.addCustomButton("How to Play", () => showTutorial(modal), { classes: ["tutorial-button"], position: 'start' });

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

function showTutorial(parentModal: Modal): void {
	parentModal.destroyModal();

	const steps = [
		{
			title: "Welcome to DungeonSweeper!",
			text: "The goal is to kill the boss. A revealed tile shows a number indicating the total strength of all adjacent monsters. \n\n" +
				"The highlighted 4 indicates, that the sum of the adjacent monsters is 4. So, in this case, the 3 and the 1 are adjacent to the 4.",
			image: "./res/tutorial4.png",
		},
		{
			title: "Basic Controls",
			text: "LEFT CLICK to reveal a tile. Be careful! If it's a monster, you'll take damage.\n\nRIGHT CLICK to place a flag on a tile you suspect hides a monster.",
			image: "./res/tutorial1.png",
		},
		{
			title: "Monsters & Leveling",
			text: "Clicking a monster damages you. \n\nStronger monsters deal more damage. \n\nDefeat monsters and clear tiles to gain experience and level up, making you stronger and recharging your abilities!",
			image: "./res/tutorial2.png",
		},
		{
			title: "Classes & Abilities",
			text: "Each class has unique powers. The Warrior gains health on level up, the Mage has a fireball, and the Assassin can execute enemies with a right-click. Choose wisely! \n\n" +
				"To use the fireball, you have to click the fireball button and then click on a tile you want to attack. This opens a 3x3 area." +
				"\n\nTo use the Assassin's special ability, you have to click on a monster with a right click. If the monster is of the same level as you, you won't take any damage.",
			image: "", // Placeholder for classes image
		},
	];

	let currentStep = 0;

	const tutorialModal = new Modal(document.body, {
		confirmButton: false,
		cancelButton: false,
		showClass: false,
		showClassDescription: false,
		showSlot: false,
	});

	const imageElement = document.getElementById("modal-image") as HTMLImageElement;

	const renderStep = () => {
		const step = steps[currentStep];
		tutorialModal.setTitle(`Tutorial (${currentStep + 1}/${steps.length})`);
		tutorialModal.setSubTitle(step.title);
		tutorialModal.setText(step.text);

		if (step.image && imageElement) {
			imageElement.src = step.image;
			imageElement.style.display = "block";
		} else if (imageElement) {
			imageElement.style.display = "none";
		}

		prevButton.style.display = currentStep === 0 ? "none" : "inline-block";
		nextButton.innerText = currentStep === steps.length - 1 ? "Finish" : "Next";
	};

	const prevButton = tutorialModal.addCustomButton("Previous", () => {
		if (currentStep > 0) {
			currentStep--;
			renderStep();
		}
	});

	const nextButton = tutorialModal.addCustomButton("Next", () => {
		if (currentStep < steps.length - 1) {
			currentStep++;
			renderStep();
		} else {
			tutorialModal.destroyModal();
			showInitialModal();
		}
	});

	renderStep();
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

function setupSpecialAbilityButton() {
	const specialAbilityBtn = document.getElementById("specialAbility") as HTMLButtonElement | null;
	if (!specialAbilityBtn) return;

	specialAbilityBtn.addEventListener('click', (e) => {
		e.preventDefault();
		e.stopPropagation();
		gameInstance.player.useSpecialAbility();
	});
}

export function updateSpecialAbilityButton() {
	const specialAbilityBtn = document.getElementById("specialAbility") as HTMLButtonElement | null;
	if (!specialAbilityBtn) return;

	const specialAbility = gameInstance.player.getSpecialAbility();

	if (specialAbility) {
		specialAbilityBtn.style.display = "";
		specialAbilityBtn.classList.toggle("ability-waiting", specialAbility.isWaiting);
		specialAbilityBtn.classList.toggle("ability-ready", specialAbility.isReady);
	} else {
		specialAbilityBtn.style.display = "none";
	}
}