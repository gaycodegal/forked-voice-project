
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

interface Text {
	language: string;
	languageCode: string;
	title: string;
	text: string;
}

export class TextDisplayElement {
	root: HTMLDivElement;
	languageSelector: HTMLSelectElement;
	textSelector: HTMLSelectElement;
	textDisplay: HTMLQuoteElement;

	texts: {[language: string]: {[title: string]: string}};

	constructor(settings: Settings) {
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
		new TextAdditionDialog(this, this.root);
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
		} else {
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

	addText(language: string, languageCode: string, name: string, content: string): boolean {
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
		return true;
	}
}

export class TextAdditionDialog {
	root: HTMLDivElement;
	languageInput: HTMLInputElement;
	languageCodeInput: HTMLInputElement;
	nameInput: HTMLInputElement;
	textInput: HTMLTextAreaElement;
	manager: TextDisplayElement;

	constructor(manager: TextDisplayElement, parent: HTMLElement|null = null) {
		this.manager = manager;
		this.root = document.createElement("div");
		this.root.classList.add("FTVT-textAdditionDialog");

		this.languageInput = document.createElement("input");
		const languageInputLabel = document.createElement("label");
		languageInputLabel.innerHTML = "<span>Language:</span>";
		this.languageInput.placeholder = "e.g. “English”, “Deutsch”, “Nederlands”, …"
		languageInputLabel.appendChild(this.languageInput);
		this.root.appendChild(languageInputLabel);

		this.languageCodeInput = document.createElement("input");
		const languageCodeInputLabel = document.createElement("label");
		languageCodeInputLabel.innerHTML = "<span>Language-Code:</span>";
		this.languageCodeInput.placeholder = "e.g. “en”, “de”, “nl”, …"
		languageCodeInputLabel.appendChild(this.languageCodeInput);
		this.root.appendChild(languageCodeInputLabel);

		this.nameInput = document.createElement("input");
		const nameInputLabel = document.createElement("label");
		nameInputLabel.innerHTML = "<span>Name:</span>";
		this.nameInput.placeholder = "The name of the Text, e.g. “Rainbow Passage”";
		nameInputLabel.appendChild(this.nameInput);
		this.root.appendChild(nameInputLabel);
		
		this.textInput = document.createElement("textarea");
		const textInputLabel = document.createElement("label");
		textInputLabel.innerHTML = "<span>Text:</span>";
		textInputLabel.appendChild(this.textInput);
		this.root.appendChild(textInputLabel);

		const addButton = document.createElement("button");
		addButton.innerText = "Add Text";
		addButton.classList.add("FTVT-wideButton");
		this.root.appendChild(addButton);
		addButton.addEventListener("click", (event) => {
			this.addText();
		});

		//const storeButton = document.createElement("button");
		//storeButton.innerText = "Store Text";
		//storeButton.classList.add("FTVT-wideButton");
		//this.root.appendChild(storeButton);

		if (parent) {
			parent.appendChild(this.root);
		}
	}

	addText() {
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
			escapeHTML(this.languageInput.value),
			escapeHTML(this.languageCodeInput.value),
			escapeHTML(this.nameInput.value),
			rawTextToHTML(this.textInput.value)
		);
		if (success) {
			this.nameInput.value = "";
			this.textInput.value = "";
		}
	}

	getRoot(): HTMLDivElement {
		return this.root;
	}
}

