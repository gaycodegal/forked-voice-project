
class BooleanSetting {
	root : HTMLLabelElement;
	checkbox: HTMLInputElement;

	constructor(parent: HTMLElement, label: string, defaultValue: boolean = false) {
		this.root = document.createElement("label");
		this.root.appendChild(document.createTextNode(label));

		this.checkbox = document.createElement("input");
		this.checkbox.checked = defaultValue;
		this.checkbox.type = "checkbox";
		this.root.appendChild(this.checkbox);
		parent.appendChild(this.root);
	}

	getRoot(): HTMLLabelElement {
		return this.root;
	}

	getValue(): boolean {
		return this.checkbox.checked;
	}
}


class Storage extends BooleanSetting {
	public static NAME = "Allow Storage";

	constructor(parent: HTMLElement) {
		const available = (localStorage.getItem(Storage.NAME) == "true");
		super(parent, Storage.NAME, available);
		this.checkbox.addEventListener("change", (event) => {
			this.onToggle();
		});
	}

	onToggle() {
		if(this.getValue()) {
			localStorage.setItem(Storage.NAME, "true");
		} else {
			localStorage.clear();
		}
	}

	available() : boolean {
		return (localStorage.getItem(Storage.NAME) == "true");
	}

	getOr(key: string, fallback: string) {
		if (!this.available()) {
			return fallback;
		}
		const value = localStorage.getItem(key);
		if (value == null) {
			return fallback;
		} else {
			return value;
		}
	}
	update(key: string, value: string) {
		if (this.available()) {
			localStorage.setItem(key, value);
		}
	}
}

export class Settings {
	root: HTMLDivElement;
	storage: Storage;

	constructor() {
		this.root = document.createElement("div");
		this.root.popover="auto";
		this.root.id = "FTVT-settings";
		this.root.classList.add("FTVT-popover");

		this.root.innerHTML="<h2>Programm Settings</h2>";

		this.storage = new Storage(this.root);
	}

	getRoot(): HTMLDivElement {
		return this.root;
	}
}
