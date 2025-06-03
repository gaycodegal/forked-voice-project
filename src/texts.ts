
import {UserInterface} from "./user_interface";

import { TEXTS_TABLE } from "./raw_texts";

import {Settings} from "./settings";

import {escapeHTML, rawTextToHTML} from "./escape_html";

import {LanguageManager, LanguageSelector} from "./languageSelector";

function clearSelector(element: HTMLSelectElement) {
	var i, L = element.options.length - 1;
	for(i = L; i >= 0; i--) {
		element.remove(i);
	}
}

export interface Text {
	languageCode: string;
	title: string;
	content: string;
}

export class TextDisplayElement {
	root: HTMLDivElement;
	languageSelector: HTMLSelectElement;
	textSelector: HTMLSelectElement;
	textDisplay: HTMLQuoteElement;
	removeButton: HTMLButtonElement;
	settings: Settings;
	addDialog: TextAdditionDialog;
	languageManager: LanguageManager;

	texts: {[language: string]: {[title: string]: string}};

	private constructor(settings: Settings) {
		this.settings = settings;
		this.languageManager = new LanguageManager(settings);
		this.texts = structuredClone(TEXTS_TABLE);
		this.root = document.createElement("div");
		this.root.classList.add("FTVT-textDisplay");
		let selectorDiv = document.createElement("div");
		selectorDiv.classList.add("FTVT-selectorDiv");
		this.languageSelector = document.createElement("select");
		this.languageSelector.classList.add("FTVT-languageSelector");
		this.languageSelector.title = "Select Language"
		selectorDiv.appendChild(this.languageSelector);

		this.textSelector = document.createElement("select");
		this.textSelector.classList.add("FTVT-textSelector");
		this.textSelector.title = "Select Text";
		selectorDiv.appendChild(this.textSelector);

		this.root.appendChild(selectorDiv);

		this.textDisplay = document.createElement("blockquote");
		this.root.appendChild(this.textDisplay);
		for(let language in this.texts) {
			const option = this.languageManager.makeOption(language);
			this.languageSelector.add(option);
		}
		this.onLanguageSelect();

		this.addDialog = new TextAdditionDialog(this, this.root);
		const bottomControls = document.createElement("div");
		bottomControls.classList.add("FTVT-bottom-controls");
		this.root.appendChild(bottomControls);

		const addButton = document.createElement("button");
		addButton.innerText = "➕";
		addButton.title = "Add (custom) text";
		addButton.addEventListener("click", (event) => {this.addDialog.show();});
		bottomControls.appendChild(addButton);

		this.removeButton = document.createElement("button");
		this.removeButton.innerText = "🗑️";
		this.removeButton.title = "Delete text";
		this.removeButton.addEventListener("click", (event) => {this.removeCurrent();});
		bottomControls.appendChild(this.removeButton);
	}
	static async construct(settings: Settings): Promise<TextDisplayElement> {
		const ret = await new TextDisplayElement(settings);
		await ret.languageManager.load();
		const texts = await ret.settings.db.getTexts();
		for (const text of texts) {
			ret.addText(text.languageCode, text.title, text.content, false);
		}
		ret.settings.registerInput("language", ret.languageSelector);
		ret.onLanguageSelect();
		ret.settings.registerInput("display-text", ret.textSelector);
		ret.languageSelector.addEventListener("change", (event) => {
			ret.onLanguageSelect();
			ret.getSelectedText();
		});
		ret.textSelector.addEventListener("change", (event) => {
			ret.getSelectedText();
		});
		ret.getSelectedTextOrFallback();
		return ret;
	}

	getRoot(): HTMLDivElement {
		return this.root;
	}

	getSelectedTextName(): string {
		return this.textSelector.value;
	}

	getSelectedLanguage(): string {
		return this.languageSelector.value;
	}

	getSelectedLanguageName(): string {
		const name = this.languageManager.getNameForCode(this.getSelectedLanguage());
		if (name == null) {
			return "unknown";
		} else {
			return name;
		}
	}

	getSelectedText(): boolean {
		const lang = this.languageSelector.value;
		let text = this.textSelector.value;
		if (lang in this.texts && text in this.texts[lang]){
			this.textDisplay.innerHTML = this.texts[lang][text];
			if (lang in TEXTS_TABLE && text in TEXTS_TABLE[lang]) {
				this.removeButton.disabled = true;
			} else {
				this.removeButton.disabled = false;
			}
			return true;
		}
		return false;
	}

	getSelectedTextOrFallback() {
		if (this.getSelectedText()) {
			return;
		}
		const lang = this.languageSelector.value;
		let text = this.textSelector.value;
		if (lang in this.texts && Object.keys(this.texts[lang]).length > 0) {
			const textName = Object.keys(this.texts[lang])[0];
			this.selectText(lang, textName);
		} else if (Object.keys(this.texts).length > 0) {
			const newLang = Object.keys(this.texts)[0];
			const textName = Object.keys(this.texts[newLang])[0];
			this.selectText(newLang, textName);
		} else {
			// this should NEVER happen!
			this.textDisplay.innerHTML = "";
		}
	}

	onLanguageSelect() {
		const language= this.getSelectedLanguage();
		clearSelector(this.textSelector);
		for(let key in this.texts[language]) {
			if (key != "languageCode") {
				this.textSelector.add(new Option(key));
			}
		}
		this.textSelector.lang = language;
		this.textDisplay.lang = language;
		this.textSelector.dispatchEvent(new Event("change"));
	}

	selectLanguage(language: string) {
		this.languageSelector.value = language;
		this.onLanguageSelect();
	}
	selectText(language: string, name: string) {
		this.selectLanguage(language);
		this.textSelector.value = name;
		this.textSelector.dispatchEvent(new Event("change"));
	}

	addText(languageCode: string, name: string, content: string, store: boolean): boolean {
		if (!(languageCode in this.texts)) {
			this.texts[languageCode] = {"languageCode": languageCode};
			const option = this.languageManager.makeOption(languageCode);
			this.languageSelector.add(option);
		} else if (name in this.texts[languageCode]) {
			alert("Error: There is already a text titled “"+name+"”");
			return false;
		}
		this.texts[languageCode][name] = content;
		if (this.getSelectedLanguage() == languageCode) {
			const option = new Option(name);
			option.lang = languageCode;
			this.textSelector.add(option);
		}
		if (store) {
			this.settings.db.addText(languageCode, name, content);
		}
		return true;
	}

	removeCurrent() {
		const language = this.getSelectedLanguage();
		const text = this.textSelector.value;
		delete this.texts[language][text];
		this.textSelector.remove(this.textSelector.selectedIndex);

		if (Object.keys(this.texts[language]).length <= 1) {
			delete this.texts[language];
			this.languageSelector.remove(this.languageSelector.selectedIndex);
		}
		this.settings.db.deleteText(language, text);
		this.getSelectedTextOrFallback();
		this.textSelector.dispatchEvent(new Event("change"));
		this.languageSelector.dispatchEvent(new Event("change"));
	}
}

export class TextAdditionDialog {
	root: HTMLDialogElement;
	languageSelector: LanguageSelector;
	nameInput: HTMLInputElement;
	textInput: HTMLTextAreaElement;
	manager: TextDisplayElement;

	constructor(manager: TextDisplayElement, parent: HTMLElement|null = null) {
		this.manager = manager;
		this.root = document.createElement("dialog");
		this.root.setAttribute("closedby", "any");
		this.root.classList.add("FTVT-textAdditionDialog");

		const formDiv = document.createElement("div");
		formDiv.classList.add("FTVT-textAdditionDialogFormDiv");
		this.root.appendChild(formDiv);


		const languageInputLabel = document.createElement("label");
		languageInputLabel.innerHTML = "<span>Language:</span>";
		this.languageSelector = manager.languageManager.makeSelector(languageInputLabel);
		formDiv.appendChild(languageInputLabel);

		this.nameInput = document.createElement("input");
		const nameInputLabel = document.createElement("label");
		nameInputLabel.innerHTML = "<span>Name:</span>";
		this.nameInput.placeholder = "The name of the Text, e.g. “Rainbow Passage”";
		this.nameInput.lang = this.languageSelector.getCode();
		nameInputLabel.appendChild(this.nameInput);
		formDiv.appendChild(nameInputLabel);
		
		this.textInput = document.createElement("textarea");
		this.textInput.rows = 10;
		this.textInput.lang = this.languageSelector.getCode();
		this.textInput.placeholder = "Lorem Ipsum…"
		const textInputLabel = document.createElement("label");
		textInputLabel.innerHTML = "<span>Text:</span>";
		textInputLabel.appendChild(this.textInput);
		formDiv.appendChild(textInputLabel);

		this.languageSelector.selector.addEventListener("change", (event) => {
			const newLang = this.languageSelector.getCode();
			this.nameInput.lang = newLang;
			this.textInput.lang = newLang;
		});

		const bottomControls = document.createElement("div");
		bottomControls.classList.add("FTVT-bottom-controls");
		this.root.appendChild(bottomControls);

		const addButton = document.createElement("button");
		addButton.innerText = "➕";
		addButton.title = "Add text";
		bottomControls.appendChild(addButton);
		addButton.addEventListener("click", (event) => {
			this.root.close();
			this.addText(true);
		});

		const cancelButton = document.createElement("button");
		cancelButton.innerText = "❌";
		cancelButton.title = "Cancel";
		cancelButton.addEventListener("click", (event) => {this.root.close();});
		bottomControls.appendChild(cancelButton);

		if (parent) {
			parent.appendChild(this.root);
		}
	}

	addText(store: boolean = false) {
		let errors = "";
		if (!this.nameInput.value) {
			errors += "Text has no name.\n";
		}
		if (!this.textInput.value) {
			errors += "Text is empty.\n";
		}
		if (errors != "") {
			alert("Error:\n" + errors);
			return;
		}
		const languageCode = this.languageSelector.getCode();
		const name = this.nameInput.value;
		const success = this.manager.addText(
			languageCode,
			name,
			rawTextToHTML(this.textInput.value),
			store
		);
		if (success) {
			this.nameInput.value = "";
			this.textInput.value = "";
			this.manager.selectText(languageCode, name);
		}
	}

	getRoot(): HTMLDialogElement {
		return this.root;
	}

	show() {
		this.root.showModal();
	}
}

