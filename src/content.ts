import { GameMaster } from "./classes/gameMaster";
import { Modal } from "./util/modal";

const settingsForm = document.getElementById("template-settings");
const menu = document.getElementById("menu");

export function initialize() {
	const settingsButton = document.getElementById("openSettings");
	initalModal();
	if (settingsButton)
		settingsButton.addEventListener("click", () => toggleSettings(), false);

	const resetButton = document.getElementById("reset");
	if (resetButton) resetButton.addEventListener("click", () => resetGame(), false);

	if (menu) menu.style.display = "none";

	GameMaster.getInstance().getSettings();

	document.addEventListener("wheel", (e) => wheel(e));

	document.addEventListener('touchstart', (e) => pinchStart(e), false);
	document.addEventListener('touchmove', (e) => pinchMove(e), false);
}

let dist: number = 0;

function pinchStart(e: TouchEvent) {
	if (e.touches.length === 2) {
		dist = Math.hypot(
			e.touches[0].pageX - e.touches[1].pageX,
			e.touches[0].pageY - e.touches[1].pageY
		);
	}
}

function pinchMove(e: TouchEvent) {
	if (e.touches.length === 2 && e.changedTouches.length == 2) {
		const newDist = Math.hypot(
			e.touches[0].pageX - e.touches[1].pageX,
			e.touches[0].pageY - e.touches[1].pageY
		);

		const root = document.documentElement;
		if (!root) throw new Error("No :root found");

		let size = +getComputedStyle(root)
			.getPropertyValue('--button-size').replace("em", "");

		const menu = document.getElementById("menu");
		if (newDist > dist && menu)
			size += 0.03;
		else
			size -= 0.03;

		root.style.setProperty("--button-size", size + "em");
	}
}

function wheel(e: WheelEvent) {
	console.log(e.deltaY);

	const root = document.documentElement;
	if (!root) throw new Error("No :root found");

	let size = +getComputedStyle(root)
		.getPropertyValue('--button-size').replace("em", "");

	if (e.deltaY > 0)
		size += 0.1;
	else
		size -= 0.1;

	root.style.setProperty("--button-size", size + "em");
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

	const modal = new Modal(document.body, { cancelButton: true });
	modal.setTitle("Game Settings");
	modal.setText("Please choose the settings for your next round");
	modal.setSlotContent(settingsForm.innerHTML);
	modal.setConfirmAction(() => GameMaster.getInstance().resetGame());
}

function resetGame() {
	GameMaster.getInstance().resetGame();
}