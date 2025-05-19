
import {UserInterface} from "./user_interface";

import { TEXTS_TABLE } from "./raw_texts"

export class TextManager {
	languageSelector: HTMLSelectElement;
	textSelector: HTMLSelectElement;
	textDisplay: HTMLQuoteElement;

	constructor(ui: UserInterface) {
		this.languageSelector = ui.languageSelector;
		this.textSelector = ui.textSelector;
		this.textDisplay = ui.textDisplay;
		for(let language in TEXTS_TABLE) {
			const option = new Option(language);
			const languageCode = TEXTS_TABLE[language]['languageCode'];
			option.lang = languageCode;
			this.languageSelector.add(option);
		}
		this.onLanguageSelect();
		this.languageSelector.addEventListener("change", (event) => {
			this.onLanguageSelect();
			this.getSelectedText();
		});
		this.textSelector.addEventListener("change", (event) => {
			this.getSelectedText();
		});
		this.getSelectedText();
	}

	public static clearSelector(element: HTMLSelectElement) {
		var i, L = element.options.length - 1;
		for(i = L; i >= 0; i--) {
			element.remove(i);
		}
	}

	getSelectedText() {
		const lang = this.languageSelector.value;
		let text = this.textSelector.value;
		if (lang in TEXTS_TABLE && text in TEXTS_TABLE[lang]){
			this.textDisplay.innerText = TEXTS_TABLE[lang][text];
		} else {
			this.textDisplay.innerText = "";
		}
	}

	onLanguageSelect() {
		const language = this.languageSelector.value;
		const languageCode = TEXTS_TABLE[language]['languageCode'];
		TextManager.clearSelector(this.textSelector);
		for(let key in TEXTS_TABLE[language]) {
			if (key != "languageCode") {
				this.textSelector.add(new Option(key));
			}
		}
		this.textSelector.lang = languageCode;
		this.textDisplay.lang = languageCode;
	}
}
