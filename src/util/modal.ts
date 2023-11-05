interface modalSettings {
	confirmButton: boolean;
	cancelButton: boolean;
	ignorable: boolean;
}
export class Modal {
	private modalSettings: modalSettings = {
		confirmButton: true,
		cancelButton: false,
		ignorable: false,
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
	}

	private destroyModal() {
		document.getElementById("modal-bg")?.remove();
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
}
