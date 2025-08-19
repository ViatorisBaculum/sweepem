import defaults from "./defaults";
import { GameMaster } from "../classes/gameMaster";
import { playerClasses } from "../util/customTypes";
import { isCapacitorEnvironment, adjustModalPaddingForStatusBar } from "./capacitorUtils";

interface modalSettings {
	cancelButton?: boolean;
	confirmButton?: boolean;
	title?: string;
	subtitle?: string;
	text?: string;
	showClass?: boolean;
	showClassDescription?: boolean;
	showSlot?: boolean;
	showTitle?: boolean;
	showSubTitle?: boolean;
	showLeaderboard?: boolean;
	customClass?: string;
}

export class Modal {
	private modalSettings: modalSettings = {
		cancelButton: false,
		confirmButton: true,
		showClass: true,
		showClassDescription: true,
		showSlot: true,
		showTitle: true,
		showLeaderboard: true,
		showSubTitle: true
	};
	parentNode: HTMLElement;
	node: Node;
	controlsContainer: HTMLElement;

	constructor(parentNode: HTMLElement, modalSettings?: modalSettings) {
		this.parentNode = parentNode;
		this.modalSettings = { ...this.modalSettings, ...modalSettings };
		const template = document.getElementById("template-modal");
		if (!template) throw new Error("No modal-template found");
		this.node = (template as HTMLTemplateElement).content.cloneNode(true);
		this.node = parentNode.appendChild(this.node);

		const controls = document.querySelector(".controls");
		if (!controls) throw new Error("No controls container found in modal template");
		this.controlsContainer = controls as HTMLElement;

		if (modalSettings?.customClass) {
			const modalElement = document.querySelector(".modal");
			modalElement?.classList.add(modalSettings.customClass);
		}

		// Adjust modal padding for Capacitor environment
		if (isCapacitorEnvironment()) {
			const modalElement = document.querySelector(".modal") as HTMLElement | null;
			if (modalElement) {
				adjustModalPaddingForStatusBar(modalElement).catch(error => {
					console.warn('Error adjusting modal padding for status bar:', error);
				});
			}
		}

		this.setCancelAction();
		this.parseModalSettings();
		this.setClassTitle(defaults.playerClass);
		this.addEventListener();
	}

	public destroyModal() {
		document.getElementById("modal-bg")?.remove();
	}

	private parseModalSettings() {
		if (!this.modalSettings.cancelButton)
			document.getElementById("modal-cancel")?.remove();
		if (!this.modalSettings.confirmButton)
			document.getElementById("modal-confirm")?.remove();
		if (this.modalSettings.title) this.setTitle(this.modalSettings.title);
		if (this.modalSettings.subtitle)
			this.setSubTitle(this.modalSettings.subtitle);
		if (this.modalSettings.text) this.setText(this.modalSettings.text);
		if (!this.modalSettings.showClass)
			document.getElementById("modal-class")?.remove();
		if (!this.modalSettings.showClassDescription)
			document.getElementById("modal-classDescription")?.remove();
		if (!this.modalSettings.showSlot)
			document.getElementById("modal-slot")?.remove();
		if (!this.modalSettings.showTitle)
			document.getElementById("modal-title")?.remove();
		if (!this.modalSettings.showSubTitle)
			document.getElementById("modal-subtitle")?.remove();
		if (!this.modalSettings.showLeaderboard)
			document.getElementById("modal-leaderboard")?.remove();
	}

	setSubTitle(title: string) {
		const modal = document.getElementById("modal-subtitle");
		if (modal) {
			modal.innerText = title;
			this.setClassTitle(title); // Update the description as well
		}
	}
	setTitle(title: string) {
		const modal = document.getElementById("modal-title");
		if (modal) {
			modal.innerText = title;
		}
	}
	setClassTitle(title: string) {
		const modal = document.getElementById("modal-class");
		if (modal) {
			modal.innerText = title;
		}
	}
	setClassText(title: string) {
		const modal = document.getElementById("modal-classDescription");
		if (modal) {
			switch (title) {
				case "Assassin":
					modal.innerText = "The assassin can kill monsters on his Level \n" +
						"• Right click on a monster on the same level to kill it without taking damage \n" +
						"• Right click on a lower level monster will give you 1 damage \n" +
						"• Opening an area with right click will give you 1 damage when the area contains a monster on the same level or higher";
					break;
				case "Warrior":
					modal.innerText = "The warrior gains hearts on level up";
					break;
				case "Paladin":
					modal.innerText = "The paladin has high health to begin with";
					break;
				case "Mage":
					modal.innerText = "The mage can throw fire balls";
					break;
				default:
					break;
			}
		}
	}
	setSlotContent(content: string) {
		const modal = document.getElementById("modal-slot");
		if (modal) {
			modal.innerHTML = content;
		}
	}
	setText(text: string) {
		const modal = document.getElementById("modal-text");
		if (modal) {
			modal.innerText = text;
		}
	}
	setTextAsHTML(html: string) {
		const modal = document.getElementById("modal-text");
		if (modal) {
			modal.innerHTML = html;
		}
	}
	setLeaderboardContent(content: number[]) {
		const modal = document.getElementById("modal-leaderboard");
		if (modal) {
			// show only ten best scores
			content = content.slice(0, 10);
			content.forEach((score) => {
				const li = document.createElement("li");
				li.innerText = score.toString();
				modal.appendChild(li);
			});
		}
	}
	setDefaultClass() {
		const storedPlayerClass = this.getStoredPlayerClass() as playerClasses;
		const playerClass = storedPlayerClass ? storedPlayerClass : defaults.playerClass;
		const select = document.getElementById("selectClass") as HTMLSelectElement;
		if (select) {
			select.value = playerClass;
			this.setClassTitle(playerClass);
		}
	}

	// get stored player class from localStorage
	private getStoredPlayerClass(): string | null {
		let classValue = defaults.playerClass;

		// Try to get the class from localStorage
		const localSettings = localStorage.getItem("instance");
		if (localSettings) {
			try {
				const storedSettings = JSON.parse(localSettings);
				if (storedSettings.playerClass) {
					classValue = storedSettings.playerClass;
				}
			} catch (e) {
				// ignore parse errors, fallback to default
			}
		}
		return classValue;
	}

	public addCustomButton(text: string, cb: () => void, options?: { classes?: string[], position?: 'start' | 'end' }): HTMLButtonElement {
		const button = document.createElement("button");
		button.innerText = text;
		button.addEventListener("click", cb);

		if (options?.classes) {
			button.classList.add(...options.classes);
		}

		if (options?.position === 'start') {
			this.controlsContainer.prepend(button);
		} else {
			this.controlsContainer.appendChild(button);
		}

		return button;
	}

	setConfirmAction(cb: Function) {
		const confirmButton = document.getElementById("modal-confirm");
		if (confirmButton) {
			confirmButton.addEventListener("click", () => {
				cb();
				this.destroyModal();
			});
		}
	}
	setCancelAction(cb?: Function) {
		const cancelButton = document.getElementById("modal-cancel");
		if (cancelButton) {
			cancelButton.addEventListener("click", () => {
				if (cb) cb();
				this.destroyModal();
			});
		}
	}
	addEventListener() {
		const observer = new MutationObserver((_, obs) => {
			const select = document.getElementById("selectClass") as HTMLSelectElement;
			if (select) {
				const game = GameMaster.getInstance();
				const updateDescription = () => game.updateClassDescription(select.value as playerClasses);

				select.addEventListener("change", updateDescription);
				updateDescription(); // Initial call

				obs.disconnect(); // Stop observing once found
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	}

	setConfirmButtonText(text: string) {
		const button = document.getElementById("modal-confirm");
		if (button) {
			button.innerText = text;
		}
	}

	setCancelButtonText(text: string) {
		const button = document.getElementById("modal-cancel");
		if (button) {
			button.innerText = text;
		}
	}

	setSecondaryConfirmButtonText(text: string) {
		const button = document.getElementById("modal-secondary-confirm");
		if (button) {
			button.innerText = text;
			button.style.display = "inline-block";
		}
	}

	setSecondaryConfirmAction(cb: Function) {
		const button = document.getElementById("modal-secondary-confirm");
		if (button) {
			button.addEventListener("click", () => {
				cb();
				this.destroyModal();
			});
		}
	}
}
