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
}
