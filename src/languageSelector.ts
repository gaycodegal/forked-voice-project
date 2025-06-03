import {Settings} from "./settings"

import {languageCodes} from "./languages.json"


export class LanguageManager {
	settings: Settings;
	nameDict: {[language: string]: string};
	codeDict: {[code: string]: string};

	selectors: LanguageSelector[];

	constructor(settings: Settings) {
		this.settings = settings;
		this.nameDict = {};
		this.codeDict = {};
		this.selectors = [];
		for(const lang of languageCodes) {
			this.putLanguage(lang.name, lang.code);
		}
	}

	async load() {
		const dbData = await this.settings.db.getLanguages();
		for(const lang of dbData) {
			this.putLanguage(lang.name, lang.code);
		}
	}

	makeOption(code: string): HTMLOptionElement {
		let option = new Option(this.codeDict[code], code);
		option.setAttribute("lang", code);
		return option;
	}

	putLanguage(name: string, code: string) {
		if (!(code in this.codeDict)) {
			this.codeDict[code] = name;
			this.nameDict[name] = code;
			this.selectors.forEach((s, i) => {s.selector.add(this.makeOption(code));});
		}
	}

	getNameForCode(code: string): string|null {
		if (code in this.codeDict) {
			return this.codeDict[code];
		} else return null;
	}

	getCodeForName(name: string): string|null {
		if (name in this.nameDict) {
			return this.nameDict[name];
		} else return null;
	}

	makeSelector(parent: HTMLElement) {
		const ret = new LanguageSelector(parent, this);
		Object.keys(this.codeDict).forEach((code) => {ret.selector.add(this.makeOption(code));});
		this.selectors.push(ret);
		return ret;
	}

}

export class LanguageSelector {
	manager: LanguageManager;

	root: HTMLDivElement;
	selector: HTMLSelectElement;
	addDialog: HTMLDialogElement;

	constructor(parent: HTMLElement, manager: LanguageManager) {
		this.manager = manager;
		this.root = document.createElement("div");
		this.root.classList.add("FTVT-languageSelector");
		parent.appendChild(this.root);

		this.selector = document.createElement("select");
		this.root.appendChild(this.selector);

		const addButton = document.createElement("button");
		this.root.appendChild(addButton);
		addButton.innerText="➕";
		addButton.title = "add text";
		addButton.addEventListener("click", (event) => {
			this.addLanguage();
		});

		this.addDialog = document.createElement("dialog");
		this.root.appendChild(this.addDialog);
	}

	getCode(): string {
		return this.selector.value;
	}

	addLanguage() {
		alert("Not yet implemented.");
		//this.addDialog.show();
	}
}
