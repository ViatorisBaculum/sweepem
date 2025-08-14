import { GameMaster } from "./classes/gameMaster";
import { Modal } from "./util/modal";
import { ThemeManager, Theme } from "./util/theme";
import { SaveManager } from "./classes/saveManager";

type Nullable<T> = T | null;

const gameInstance = GameMaster.getInstance();
const startScreen = document.getElementById("template-startScreen") as Nullable<HTMLTemplateElement>;
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
	setupFixedMenuOnZoom();
	showInitialModal();
	gameInstance.populateSettingsUIFromGameSettings();
	hide(menu);

	bind("openSettings", "click", () => {
		// Stop the current game cleanly
		gameInstance.stopGame();

		// Hide menu and show initial modal
		hide(menu);
		showInitialModal();
	});
	bind("reset", "click", () => gameInstance.resetGame());
	bind("openLeaderboard", "click", () => showLeaderboard());
	bind("debugLevelUp", "click", () => gameInstance.player.debugGainLevel());

	// Add keyboard event listener for arrow key navigation
	document.addEventListener('keydown', handleKeyDown);
}

export function showMenu(): void {
	show(menu);
}

function showInitialModal(): void {
	assert(settingsForm, "No settings template found");
	assert(startScreen, "No game initials template found");
	const modal = new Modal(document.body, { showTitle: false, cancelButton: false, showSubTitle: false, showClass: false, showClassDescription: false, customClass: "start-modal" });

	modal.setSlotContent(startScreen.innerHTML);

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

	// Remove debug switch from settings HTML before injecting
	const debugLabel = document.getElementById("modal-debug");
	if (debugLabel) debugLabel.remove();

	// Setup arrow button event listeners after modal is created
	setupArrowButtonEventListeners();

	// Add event listener for settings icon in start screen
	const startScreenSettingsIcon = document.querySelector('.start-modal .icon-btn.settings');
	if (startScreenSettingsIcon) {
		startScreenSettingsIcon.addEventListener('click', () => {
			modal.destroyModal();
			showSettings();
		});
	}

	// Add event listener for info icon in start screen
	const startScreenInfoIcon = document.querySelector('.start-modal .icon-btn.info');
	if (startScreenInfoIcon) {
		startScreenInfoIcon.addEventListener('click', () => {
			modal.destroyModal(); // Destroy the current modal (start screen)
			showInfoModal(); // Show the info modal
		});
	}

	gameInstance.populateSettingsUIFromGameSettings();
}

function showSettings(): void {
	assert(settingsForm, "No settings template found");
	const modal = new Modal(document.body, { cancelButton: false, confirmButton: false });

	// pause the game timer
	gameInstance.pauseTimer();

	modal.setTitle("Game Settings")
	modal.setText("Please choose the settings for your next round")
	modal.setSlotContent(settingsForm.innerHTML)

	// Add "Back to Start" button
	modal.addCustomButton("Back to Start", () => {
		// save settings before going back
		gameInstance.saveSettingsFromUI();
		modal.destroyModal();
		showInitialModal();
	}, { position: 'start' });

	modal.setDefaultClass();
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
		customClass: "leaderboard-modal",
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

// New function for info modal
function showInfoModal(): void {
	const modal = new Modal(document.body, {
		cancelButton: false, // Changed to false
		confirmButton: false,
		showSubTitle: false, // No subtitle for this modal
		showClass: false,
		showClassDescription: false,
		showSlot: false,
		customClass: "info-modal", // Custom class for potential styling
	});

	modal.addCustomButton("", () => {
		modal.destroyModal();
		showInitialModal();
	}, { classes: ["icon-btn", "back"], position: 'start' });

	// Move the back button to the beginning of the modal content
	const modalElement = document.querySelector('.info-modal');
	if (modalElement) {
		const controls = document.getElementById("modal-controls") as HTMLElement;
		modalElement.insertBefore(controls, modalElement.firstChild);
	}

	modal.setTitle("About DungeonSweeper");
	modal.setText("DungeonSweeper is a game inspired by Minesweeper, with RPG elements. Explore dungeons, defeat monsters, and level up your hero!");
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
			text: "LEFT CLICK to reveal a tile. Be careful! If it's a monster, you'll take damage.\n\nRIGHT CLICK to place a flag on a tile you suspect hides a monster." +
				"\n\nOn mobile you have to touch and hold on the tile to imitate an right click.",
			image: "./res/tutorial1.png",
		},
		{
			title: "Monsters & Leveling",
			text: "Clicking a monster damages you. \n\nStronger monsters deal more damage. \n\nDefeat monsters and clear tiles to gain experience and level up, making you stronger and recharging your abilities!",
			image: "./res/tutorial2.png",
		},
		{
			title: "Classes & Abilities",
			text:
				"Warrior\nGains health on level up\n" +
				"Mage\nHas a fireball ability, which opens a 3x3 area\n" +
				"Assassin\nHas the ability to execute monsters on his level\n" +
				"Paladin\nHas high health to begin with\n" +
				"\n\nEach class has unique powers. The Warrior gains health on level up, the Mage has a fireball, and the Assassin can execute enemies with a right-click. Choose wisely! \n\n" +
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
		customClass: "tutorial-modal",
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

	// add custom button to cancel the tutorial
	tutorialModal.addCustomButton("Cancel", () => {
		tutorialModal.destroyModal();
		showInitialModal();
	});


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

// Function to handle arrow button clicks for select elements
function setupArrowButtonEventListeners(): void {
	// Wait for the modal content to be added to the DOM
	setTimeout(() => {
		// Get all arrow buttons
		const leftArrows = document.querySelectorAll('.arrow.left');
		const rightArrows = document.querySelectorAll('.arrow.right');

		// Add event listeners to left arrows
		leftArrows.forEach(arrow => {
			arrow.addEventListener('click', function (this: HTMLElement) {
				const pickerRow = this.closest('.picker-row');
				if (pickerRow) {
					const select = pickerRow.querySelector('select');
					if (select) {
						moveSelectOption(select as HTMLSelectElement, 'left');
					}
				}
			});
		});

		// Add event listeners to right arrows
		rightArrows.forEach(arrow => {
			arrow.addEventListener('click', function (this: HTMLElement) {
				const pickerRow = this.closest('.picker-row');
				if (pickerRow) {
					const select = pickerRow.querySelector('select');
					if (select) {
						moveSelectOption(select as HTMLSelectElement, 'right');
					}
				}
			});
		});
	}, 100); // Small delay to ensure modal content is in DOM
}

// Function to move select option based on direction
function moveSelectOption(select: HTMLSelectElement, direction: 'left' | 'right'): void {
	const options = Array.from(select.options);
	const currentIndex = select.selectedIndex;
	const loop = select.closest('.picker')?.getAttribute('data-loop') === 'true';

	if (direction === 'right') {
		// Move to next option
		if (currentIndex < options.length - 1) {
			select.selectedIndex = currentIndex + 1;
		} else if (loop) {
			// Loop back to first option
			select.selectedIndex = 0;
		}
	} else if (direction === 'left') {
		// Move to previous option
		if (currentIndex > 0) {
			select.selectedIndex = currentIndex - 1;
		} else if (loop) {
			// Loop back to last option
			select.selectedIndex = options.length - 1;
		}
	}

	// Trigger change event to update any listeners
	select.dispatchEvent(new Event('change'));
}

// Function to handle keyboard arrow key events
function handleKeyDown(event: KeyboardEvent): void {
	// Only handle arrow keys
	if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
		return;
	}

	// Check if a select element is currently focused
	const focusedElement = document.activeElement;
	if (focusedElement && focusedElement.tagName === 'SELECT') {
		event.preventDefault();
		const select = focusedElement as HTMLSelectElement;

		// Determine direction based on key pressed
		if (event.key === 'ArrowRight') {
			moveSelectOption(select, 'right');
		} else if (event.key === 'ArrowLeft') {
			moveSelectOption(select, 'left');
		}
	}
}

// // Prevent double-tap zoom on mobile
// document.addEventListener('touchstart', function (e) {
// 	if (e.touches.length > 1) {
// 		e.preventDefault();
// 	}
// }, { passive: false });

// Prevent pull-to-refresh
//document.body.style.overscrollBehavior = 'none';

function setupFixedMenuOnZoom(): void {
	const updateMenu = () => {
		const menu = document.getElementById('menu');
		const viewport = window.visualViewport;

		assert(menu, "Menu element not found");
		assert(viewport, "Visual viewport not available");

		const scale = viewport.scale;
		const margin = 10;
		const layoutWidth = document.documentElement.clientWidth;
		const layoutHeight = document.documentElement.clientHeight;

		// Menügröße konstant halten
		menu.style.transform = `scale(${1 / scale})`;
		menu.style.transformOrigin = 'left bottom';

		// horizontale Position & Breite
		menu.style.left = `${viewport.offsetLeft + margin / scale}px`;
		menu.style.width = `${layoutWidth - 4 * margin}px`;

		// vertikale Position (optional ebenfalls mit Abstand)
		menu.style.bottom = `${layoutHeight - (viewport.offsetTop + viewport.height)
			}px`;
	}
	const viewport = window.visualViewport;
	assert(viewport, "Visual viewport not available");
	viewport.addEventListener('resize', updateMenu);
	viewport.addEventListener('scroll', updateMenu);
	updateMenu();
}

// Prevent double-tap zoom while allowing pinch-to-zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', function (e) {
	const now = Date.now();
	if (now - lastTouchEnd <= 300) {
		e.preventDefault();
	}
	lastTouchEnd = now;
}, { passive: false });