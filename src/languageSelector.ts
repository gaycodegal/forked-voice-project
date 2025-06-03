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

	putLanguage(name: string, code: string, addToDB: boolean = false) {
		if (!(code in this.codeDict)) {
			this.codeDict[code] = name;
			this.nameDict[name] = code;
			this.selectors.forEach((s, i) => {s.selector.add(this.makeOption(code));});
			if (addToDB) {
				this.settings.db.addLanguage(code, name);
			}
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

	addLanguage(name: string, code: string): string|null {
		let errors = "";
		if (name == "") {
			errors += "Name is empty.\n"
		} else if (name in this.nameDict) {
			errors += "Name already in use.\n";
		}

		if (code == "") {
			errors += "Code is empty.\n"
		} else if (code in this.codeDict) {
			errors += "Code already in use.\n";
		}

		if (!!errors.length) {
			return errors;
		} else {
			this.putLanguage(name, code, true);
			return null;
		}
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
		this.selector.title = "Language of new text";
		this.root.appendChild(this.selector);

		const addButton = document.createElement("button");
		this.root.appendChild(addButton);
		addButton.innerText="➕";
		addButton.title = "add Language";
		addButton.addEventListener("click", (event) => {
			this.addLanguage();
		});

		this.addDialog = document.createElement("dialog");
		this.root.appendChild(this.addDialog);

		const addDialogMain = document.createElement("div");
		addDialogMain.classList.add("FTVT-newLanguageFormMain");
		this.addDialog.appendChild(addDialogMain);

		let newLangNameLabel = document.createElement("label");
		addDialogMain.appendChild(newLangNameLabel);
		let newLangNameSpan = document.createElement("span");
		newLangNameLabel.appendChild(newLangNameSpan);
		newLangNameSpan.innerText = "Name: ";
		let newLangName = document.createElement("input");
		newLangNameLabel.appendChild(newLangName);
		newLangName.placeholder = "e.g. “Malti”";
		newLangName.setAttribute("lang", "");


		let newLangCodeLabel = document.createElement("label");
		addDialogMain.appendChild(newLangCodeLabel);
		let newLangCodeSpan = document.createElement("span");
		newLangCodeLabel.appendChild(newLangCodeSpan);
		newLangCodeSpan.innerText = "Code: ";
		let newLangCode = document.createElement("input");
		newLangCodeLabel.appendChild(newLangCode);
		newLangCode.placeholder = "e.g. “mt”";

		const newLangBottomControls = document.createElement("div");
		this.addDialog.appendChild(newLangBottomControls);
		newLangBottomControls.classList.add("FTVT-bottom-controls");
		const newLangAddButton = document.createElement("button");
		newLangAddButton.innerText = "➕";
		newLangAddButton.title = "Add new language";
		newLangAddButton.addEventListener("click", (event) => {
			const errors = this.manager.addLanguage(newLangName.value, newLangCode.value);
			if (errors == null) {
				newLangName.value = "";
				newLangCode.value = "";
				this.addDialog.close();
			} else {
				alert("Error: Could not add language!\n" + errors);
			}
		});
		newLangBottomControls.appendChild(newLangAddButton);

		const newLangCancelButton = document.createElement("button");
		newLangCancelButton.innerText = "❌";
		newLangCancelButton.title = "Cancel";
		newLangCancelButton.addEventListener("click", (event) => {
			this.addDialog.close();
		});
		newLangBottomControls.appendChild(newLangCancelButton);
	}

	getCode(): string {
		return this.selector.value;
	}

	addLanguage() {
		this.addDialog.showModal();
	}
}
