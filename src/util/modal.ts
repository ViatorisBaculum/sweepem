import defaults from "./defaults";
interface modalSettings {
	cancelButton?: boolean;
	title?: string;
	subtitle?: string;
	text?: string;
}
export class Modal {
	private modalSettings: modalSettings = {
		cancelButton: false,
	};
	parentNode: HTMLElement;
	node: Node;

	constructor(parentNode: HTMLElement, modalSettings?: modalSettings) {
		this.parentNode = parentNode;
		this.modalSettings = modalSettings || this.modalSettings;
		const template = document.getElementById("template-modal");
		if (!template) throw new Error("No modal-template found");
		this.node = (template as HTMLTemplateElement).content.cloneNode(true);
		this.node = parentNode.appendChild(this.node);
		this.setCancelAction();
		this.parseModalSettings();
		this.setDefaultClass();
		this.setClassTitle(defaults.playerClass);
		this.addEventListener();
	}

	private destroyModal() {
		document.getElementById("modal-bg")?.remove();
	}

	private parseModalSettings() {
		if (!this.modalSettings.cancelButton)
			document.getElementById("modal-cancel")?.remove();
		if (this.modalSettings.title) this.setTitle(this.modalSettings.title);
		if (this.modalSettings.subtitle)
			this.setSubTitle(this.modalSettings.subtitle);
		if (this.modalSettings.text) this.setText(this.modalSettings.text);
	}

	setSubTitle(title: string) {
		const modal = document.getElementById("modal-subtitle");
		if (modal) {
			modal.innerText = title;
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
			this.setClassText(title);
		}
	}
	setClassText(title: string) {
		const modal = document.getElementById("modal-classDescription");
		if (modal) {
			switch (title) {
				case "Assassin":
					modal.innerText = "The assassin can kill Monster on his Level blabla";
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
	setDefaultClass() {
		setTimeout(() => {
			const select = document.getElementById("selectClass") as HTMLSelectElement;
			if (select) {
				select.value = defaults.playerClass;
			};
		}, 100);
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
		const confirmButton = document.getElementById("modal-cancel");
		if (confirmButton) {
			confirmButton.addEventListener("click", () => {
				if (cb) cb();
				this.destroyModal();
			});
		}
	}
	addEventListener() {
		// y do i have to add the fucking setTimeout again?
		setTimeout(() => {
			const select = document.getElementById("selectClass") as HTMLSelectElement;
			console.log(select); // without setTime === null
			if (select) select.addEventListener("change", () => this.setClassTitle(select.value));
		}, 1000);
	}
}
