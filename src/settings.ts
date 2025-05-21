
// TODO: These classes are a mess in need of restructuring: Storage should be separate!


class Storage {
	public static NAME = "enable storage";
	available: boolean;
	settingCollectors: (()=>[string, string])[];

	constructor(parent: HTMLElement) {
		this.available = (localStorage.getItem(Storage.NAME) == "true");
		this.settingCollectors = []
	}

	setAvailable(b: boolean) {
		if (b) {
			this.enable();
		} else {
			this.available = false;
			localStorage.clear();
		}
	}

	getOr(key: string, fallback: string) {
		if (!this.available) {
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

	update(key: string, value: string): string {
		if (this.available) {
			localStorage.setItem(key, value);
		}
		return value;
	}

	increment(key: string, n: number): number {
		if (!this.available) {
			return n+1;
		}
		const storageNum = Number(this.getOrInsert(key, n.toFixed(0)));
		const ret = Math.max(storageNum, n) + 1;
		localStorage.setItem(key, ret.toString());
		return ret;
	}

	registerCollector(c: ()=>[string, string]) {
		this.settingCollectors.push(c);
	}

	enable() {
		this.available = true;
		localStorage.setItem(Storage.NAME, "true");
		for(const collector of this.settingCollectors) {
			const [k, v] = collector();
			this.update(k, v);
		}
	}
}

class BooleanSetting {
	root : HTMLLabelElement;
	checkbox: HTMLInputElement;
	storage: Storage;
	name: string;
	callbacks: ((b:boolean)=>void)[];

	constructor(storage: Storage, parent: HTMLElement, name: string, label: string, register: boolean = true, defaultValue: boolean = false) {
		this.name = name;
		this.root = document.createElement("label");
		this.root.appendChild(document.createTextNode(label));

		this.checkbox = document.createElement("input");
		this.checkbox.checked = (storage.getOrInsert(name, defaultValue.toString())) == "true";
		this.checkbox.type = "checkbox";
		this.root.appendChild(this.checkbox);
		parent.appendChild(this.root);
		this.storage = storage;
		this.callbacks = [];

		this.checkbox.addEventListener("change", (event) => {
			this.onToggle(this.getValue());
		});
		if (register) {
			this.storage.registerCollector(() => {
				return [this.name, this.getValue().toString()];
			});
		}
	}

	onToggle(b:boolean) {
		this.storage.update(this.name, b.toString());
		for (const callback of this.callbacks) {
			callback(b);
		}
	}

	getRoot(): HTMLLabelElement {
		return this.root;
	}

	getValue(): boolean {
		return this.checkbox.checked;
	}

	addToggleListener(callback: (b: boolean) => void) {
		this.callbacks.push(callback);
	}
}


export class Settings {
	root: HTMLDivElement;
	storage: Storage;
	recordingId: number;
	enableStorage: BooleanSetting;
	autoplay: BooleanSetting;

	constructor() {
		this.root = document.createElement("div");
		this.root.popover="auto";
		this.root.id = "FTVT-settings";
		this.root.classList.add("FTVT-popover");

		this.root.innerHTML="<h2>Programm Settings</h2>";

		this.storage = new Storage(this.root);
		this.enableStorage = new BooleanSetting(this.storage, this.root, "enable storage", "Store Settings in Browser", false);
		this.enableStorage.addToggleListener((b) => {this.storage.setAvailable(b);});
		this.autoplay = new BooleanSetting(this.storage, this.root, "autoplay", "Automatically play Recording");
		this.recordingId = Number(this.storage.getOrInsert("recording index", "0"));
		this.storage.registerCollector(() => {return ["recording index", this.recordingId.toFixed(0)];});
	}

	getRoot(): HTMLDivElement {
		return this.root;
	}

	newRecordingId(): number {
		this.recordingId = this.storage.increment("recording index", this.recordingId);
		return this.recordingId;
	}

	autoplayRecording(): boolean {
		return this.autoplay.getValue();
	}

	registerInput(name: string, input: HTMLInputElement, preferStoredValue: boolean = true) {
		this.storage.registerCollector(() => {return [name, input.value];});
		if (preferStoredValue) {
			input.value = this.storage.getOrInsert(name, input.value);
		} else {
			this.storage.update(name, input.value);
		}
		input.addEventListener("change", (event) => {
			this.storage.update(name, input.value);
		});
	}
}
