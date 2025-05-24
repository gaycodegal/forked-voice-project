
import {UserInterface} from "./user_interface";

import { TEXTS_TABLE } from "./raw_texts";

import {Settings} from "./settings"

function clearSelector(element: HTMLSelectElement) {
	var i, L = element.options.length - 1;
	for(i = L; i >= 0; i--) {
		element.remove(i);
	}
}

export class TextDisplayElement {
	root: HTMLDivElement;
	languageSelector: HTMLSelectElement;
	textSelector: HTMLSelectElement;
	textDisplay: HTMLQuoteElement;

	constructor(settings: Settings) {
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
		for(let language in TEXTS_TABLE) {
			const option = new Option(language);
			const languageCode = TEXTS_TABLE[language]['languageCode'];
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
		if (lang in TEXTS_TABLE && text in TEXTS_TABLE[lang]){
			this.textDisplay.innerHTML = TEXTS_TABLE[lang][text];
		} else {
			this.textDisplay.innerHTML = "";
		}
	}

	onLanguageSelect() {
		const language = this.languageSelector.value;
		const languageCode = TEXTS_TABLE[language]['languageCode'];
		clearSelector(this.textSelector);
		for(let key in TEXTS_TABLE[language]) {
			if (key != "languageCode") {
				this.textSelector.add(new Option(key));
			}
		}
		this.textSelector.lang = languageCode;
		this.textDisplay.lang = languageCode;
		this.textSelector.dispatchEvent(new Event("change"));
	}
}
