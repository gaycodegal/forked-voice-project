
import {Database} from "./database"

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
	callbacks: ((b:boolean, checkbox: HTMLInputElement)=>void)[];

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
			callback(b, this.checkbox);
		}
	}

	getRoot(): HTMLLabelElement {
		return this.root;
	}

	getValue(): boolean {
		return this.checkbox.checked;
	}

	addToggleListener(callback: (b: boolean, checkbox: HTMLInputElement) => void) {
		this.callbacks.push(callback);
	}

	disable() {
		this.checkbox.disabled = true;
	}
}

async function toggleCaching(enable: boolean, checkbox: HTMLInputElement ,downloadButton: HTMLButtonElement) {
	if (enable) {
		try {
			await navigator.serviceWorker.register("serviceWorker.js");
			downloadButton.disabled = false;
		} catch (e) {
			alert("Could not register serviceWorker: " + e)
			checkbox.checked = false;
			return;
		}
	} else {
		downloadButton.disabled = true;
		if (navigator.serviceWorker.controller) {
			navigator.serviceWorker.controller.postMessage({
				type: 'delete caches',
			});
		}
		navigator.serviceWorker.getRegistrations().then(registrations => {
			for (const registration of registrations) {
				registration.unregister();
			}
		});
	}
}

async function requestBackgroundUpdate() {
	if (navigator.serviceWorker && navigator.serviceWorker.controller) {
		navigator.serviceWorker.controller.postMessage({
			type: 'update caches',
		});
	}
}

export class Settings {
	root: HTMLDivElement;
	storage: Storage;
	recordingId: number;
	enableStorage: BooleanSetting;
	enableCaching: BooleanSetting;
	autoplay: BooleanSetting;
	db: Database;

	private constructor() {
		this.root = document.createElement("div");
		this.root.popover="auto";
		this.root.id = "FTVT-settings";
		this.root.classList.add("FTVT-popover");

		this.root.innerHTML="<h2>Settings</h2>";

		this.storage = new Storage(this.root);
		this.enableStorage = new BooleanSetting(this.storage, this.root, "enable storage", "Store settings (locally).", false);
		this.enableStorage.addToggleListener((b, _) => {this.storage.setAvailable(b);});
		this.enableCaching = new BooleanSetting(
			this.storage, this.root, "enable caching", "Cache this application.", true,
			!!(navigator.serviceWorker) && !!(navigator.serviceWorker.controller));
		this.autoplay = new BooleanSetting(this.storage, this.root, "autoplay", "Automatically play recordings.");
		this.recordingId = Number(this.storage.getOrInsert("recording index", "0"));
		this.storage.registerCollector(() => {return ["recording index", this.recordingId.toFixed(0)];});

		let requestUpdateButton = document.createElement("button");
		requestUpdateButton.innerText = "Attempt Update";
		requestUpdateButton.classList.add("FTVT-wideButton");
		if (! navigator.serviceWorker.controller) {
			requestUpdateButton.disabled = true;
		}
		requestUpdateButton.addEventListener("click", (event)=>{
			requestBackgroundUpdate();
			alert("Update requested.");
		});
		this.root.appendChild(requestUpdateButton);
		this.enableCaching.addToggleListener((b, checkbox) => {toggleCaching(b, checkbox, requestUpdateButton);});

		this.db = new Database("recordings", null);
		this.enableStorage.addToggleListener(async (b, checkbox) => {
			const active = b && checkbox.checked;
			if (active) {
				await this.db.try_open();
			} else {
				await this.db.close();
			}

		});
	}
	
	public static async construct(): Promise<Settings> {
		const ret = new Settings();
		await ret.db.try_open_if(ret.enableStorage.getValue());
		return ret;
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
