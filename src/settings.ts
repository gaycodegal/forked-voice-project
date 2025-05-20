
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
	getOrInsert(key: string, fallback: string) {
		if (!this.available) {
			return fallback;
		}
		const value = localStorage.getItem(key);
		if (value == null) {
			localStorage.setItem(key, fallback);
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
	increment(key: string, n: number): number {
		if (!this.available()) {
			return n+1;
		}
		const storageNum = Number(this.getOrInsert(key, n.toFixed(0)));
		const ret = Math.max(storageNum, n) + 1;
		localStorage.setItem(key, ret.toString());
		return ret;
	}
}

export class Settings {
	root: HTMLDivElement;
	storage: Storage;
	recordingId: number;

	constructor() {
		this.root = document.createElement("div");
		this.root.popover="auto";
		this.root.id = "FTVT-settings";
		this.root.classList.add("FTVT-popover");

		this.root.innerHTML="<h2>Programm Settings</h2>";

		this.storage = new Storage(this.root);
		this.recordingId = Number(this.storage.getOr("recording index", "0"));
	}

	getRoot(): HTMLDivElement {
		return this.root;
	}

	newRecordingId(): number {
		this.recordingId = this.storage.increment("recording index", this.recordingId);
		return this.recordingId;
	}
}
