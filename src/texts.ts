
import {UserInterface} from "./user_interface";

import { TEXTS_TABLE } from "./raw_texts";

import {Settings} from "./settings";

import {escapeHTML, rawTextToHTML} from "./escape_html";

function clearSelector(element: HTMLSelectElement) {
	var i, L = element.options.length - 1;
	for(i = L; i >= 0; i--) {
		element.remove(i);
	}
}

export interface Text {
	language: string;
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

	texts: {[language: string]: {[title: string]: string}};

	constructor(settings: Settings) {
		this.settings = settings;
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
			const option = new Option(language);
			const languageCode = this.texts[language]['languageCode'];
			option.lang = languageCode;
			this.languageSelector.add(option);
		}
		settings.registerInput("language", this.languageSelector);
		this.onLanguageSelect();
		this.languageSelector.addEventListener("change", (event) => {
			this.onLanguageSelect();
			this.getSelectedText();
		});
		settings.registerInput("display-text", this.textSelector);
		this.getSelectedText();
		this.textSelector.addEventListener("change", (event) => {
			this.getSelectedText();
		});

		const addDialog = new TextAdditionDialog(this, this.root);
		const bottomControls = document.createElement("div");
		bottomControls.classList.add("FTVT-bottom-controls");
		this.root.appendChild(bottomControls);

		const addButton = document.createElement("button");
		addButton.innerText = "➕";
		addButton.addEventListener("click", (event) => {addDialog.show();});
		bottomControls.appendChild(addButton);

		this.removeButton = document.createElement("button");
		this.removeButton.innerText = "🗑️";
		this.removeButton.addEventListener("click", (event) => {this.removeCurrent();});
		bottomControls.appendChild(this.removeButton);
	}
	async loadStoredTexts() {
		const texts = await  this.settings.db.getTexts();
		for (const text of texts) {
			this.addText(text.language, text.languageCode, text.title, text.content, false);
		}
		this.getSelectedText();
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

	getSelectedText() {
		const lang = this.languageSelector.value;
		let text = this.textSelector.value;
		if (lang in this.texts && text in this.texts[lang]){
			this.textDisplay.innerHTML = this.texts[lang][text];
			if (lang in TEXTS_TABLE && text in TEXTS_TABLE[lang]) {
				this.removeButton.disabled = true;
			} else {
				this.removeButton.disabled = false;
			}
		} else if (lang in this.texts && Object.keys(this.texts[lang]).length > 1) {
			const textName = Object.keys(this.texts[lang])[1];
			this.selectText(lang, textName);
		} else if (Object.keys(this.texts).length > 0) {
			const newLang = Object.keys(this.texts)[0];
			const textName = Object.keys(this.texts[lang])[1];
			this.selectText(newLang, textName);
		} else {
			// this should NEVER happen!
			this.textDisplay.innerHTML = "";
		}
	}

	onLanguageSelect() {
		const language = this.languageSelector.value;
		const languageCode = this.texts[language]['languageCode'];
		clearSelector(this.textSelector);
		for(let key in this.texts[language]) {
			if (key != "languageCode") {
				this.textSelector.add(new Option(key));
			}
		}
		this.textSelector.lang = languageCode;
		this.textDisplay.lang = languageCode;
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

	addText(language: string, languageCode: string, name: string, content: string, store: boolean): boolean {
		if (!(language in this.texts)) {
			this.texts[language] = {"languageCode": languageCode};
			const option = new Option(language);
			option.lang = languageCode;
			this.languageSelector.add(option);
		} else if (name in this.texts[language]) {
			alert("Error: There is already a text titled “"+name+"”");
			return false;
		}
		this.texts[language][name] = content;
		if (this.getSelectedLanguage() == language) {
			const option = new Option(name);
			option.lang = languageCode;
			this.textSelector.add(option);
		}
		this.selectText(language, name);
		if (store) {
			this.storeText(language, languageCode, name, content);
		}
		return true;
	}

	storeText(language: string, languageCode: string, name: string, content: string) {
		this.settings.db.addText(language, languageCode, name, content);
	}

	removeCurrent() {
		const language = this.languageSelector.value;
		const text = this.textSelector.value;
		delete this.texts[language][text];
		this.textSelector.remove(this.textSelector.selectedIndex);

		if (Object.keys(this.texts[language]).length <= 1) {
			delete this.texts[language];
			this.languageSelector.remove(this.languageSelector.selectedIndex);
		}
		this.settings.db.deleteText(language, text);
		this.getSelectedText();
	}
}

export class TextAdditionDialog {
	root: HTMLDialogElement;
	languageInput: HTMLInputElement;
	languageCodeInput: HTMLInputElement;
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


		this.languageInput = document.createElement("input");
		const languageInputLabel = document.createElement("label");
		languageInputLabel.innerHTML = "<span>Language:</span>";
		this.languageInput.placeholder = "e.g. “English”, “Deutsch”, “Nederlands”, …"
		languageInputLabel.appendChild(this.languageInput);
		formDiv.appendChild(languageInputLabel);

		this.languageCodeInput = document.createElement("input");
		const languageCodeInputLabel = document.createElement("label");
		languageCodeInputLabel.innerHTML = "<span>Language-Code:</span>";
		this.languageCodeInput.placeholder = "e.g. “en”, “de”, “nl”, …"
		languageCodeInputLabel.appendChild(this.languageCodeInput);
		formDiv.appendChild(languageCodeInputLabel);

		this.nameInput = document.createElement("input");
		const nameInputLabel = document.createElement("label");
		nameInputLabel.innerHTML = "<span>Name:</span>";
		this.nameInput.placeholder = "The name of the Text, e.g. “Rainbow Passage”";
		nameInputLabel.appendChild(this.nameInput);
		formDiv.appendChild(nameInputLabel);
		
		this.textInput = document.createElement("textarea");
		this.textInput.rows = 10;
		this.textInput.placeholder = "Lorem Ipsum…"
		const textInputLabel = document.createElement("label");
		textInputLabel.innerHTML = "<span>Text:</span>";
		textInputLabel.appendChild(this.textInput);
		formDiv.appendChild(textInputLabel);

		const bottomControls = document.createElement("div");
		bottomControls.classList.add("FTVT-bottom-controls");
		this.root.appendChild(bottomControls);

		const addButton = document.createElement("button");
		addButton.innerText = "➕";
		bottomControls.appendChild(addButton);
		addButton.addEventListener("click", (event) => {
			this.root.close();
			this.addText();
		});

		const storeButton = document.createElement("button");
		storeButton.innerText = "💾";
		bottomControls.appendChild(storeButton);
		storeButton.addEventListener("click", (event) => {
			this.root.close();
			this.addText(true);
		});

		const cancelButton = document.createElement("button");
		cancelButton.innerText = "❌";
		cancelButton.addEventListener("click", (event) => {this.root.close();});
		bottomControls.appendChild(cancelButton);

		if (parent) {
			parent.appendChild(this.root);
		}
	}

	addText(store: boolean = false) {
		let errors = "";
		if (!this.languageInput.value) {
			errors += "No language set.\n";
		}
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
		const success = this.manager.addText(
			(this.languageInput.value),
			(this.languageCodeInput.value),
			(this.nameInput.value),
			rawTextToHTML(this.textInput.value),
			store
		);
		if (success) {
			this.nameInput.value = "";
			this.textInput.value = "";
		}
	}

	getRoot(): HTMLDialogElement {
		return this.root;
	}

	show() {
		this.root.showModal();
	}
}

